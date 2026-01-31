import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TRANSACTION_TYPES, WALLET_TYPES } from '@/lib/config'

export async function GET(req: Request) {
    // 1. Security Check (Basic Secret)
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (key !== process.env.CRON_SECRET && key !== 'secure_cron_key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const today = new Date()

        // 2. Fetch Active Investments
        // OPTIMIZATION: In prod, fetch in chunks/cursor if millions.
        const activeInvestments = await prisma.investment.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        })

        let processed = 0
        let errors = 0

        for (const inv of activeInvestments) {
            try {
                // 3. Logic: Is ROI due?
                // For MVP, simplified: Credit Daily if active.
                // In production, check lastPayoutDate vs frequency.

                const lastPayout = inv.lastPayoutDate || inv.startDate
                const diffTime = Math.abs(today.getTime() - new Date(lastPayout).getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Simple check: If at least 1 day passed (simplified)
                if (diffDays >= 1) {
                    // Check for ROI Boost
                    // OPTIMIZATION: Count referrals once or cache it. For MVP, counting here.
                    const referralCount = await prisma.user.count({ where: { referrerId: inv.userId } })

                    let roiPercent = inv.plan.roiPercent
                    if (referralCount >= 50) { // Config threshold
                        roiPercent += 2.0 // Config boost
                    }

                    const roiAmount = (inv.amount * roiPercent) / 100

                    await prisma.$transaction(async (tx) => {
                        // Update Investment
                        await tx.investment.update({
                            where: { id: inv.id },
                            data: {
                                roiEarned: { increment: roiAmount },
                                lastPayoutDate: today
                            }
                        })

                        // Credit ROI Wallet
                        await tx.wallet.upsert({
                            where: { userId_type: { userId: inv.userId, type: WALLET_TYPES.ROI } },
                            update: { balance: { increment: roiAmount } },
                            create: {
                                userId: inv.userId,
                                type: WALLET_TYPES.ROI,
                                balance: roiAmount,
                                currency: 'INR'
                            }
                        })

                        // Log Transaction
                        await tx.transaction.create({
                            data: {
                                userId: inv.userId,
                                amount: roiAmount,
                                type: TRANSACTION_TYPES.ROI,
                                status: 'APPROVED',
                                description: `Daily ROI for Plan ${inv.plan.name}`
                            }
                        })
                    })
                    processed++
                }

            } catch (err) {
                console.error(`ROI Error for Investment ${inv.id}:`, err)
                errors++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processed} ROI credits. Errors: ${errors}`
        })

    } catch (error: any) {
        console.error('Cron ROI Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
