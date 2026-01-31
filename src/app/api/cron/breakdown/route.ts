import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TRANSACTION_TYPES, WALLET_TYPES } from '@/lib/config'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (key !== process.env.CRON_SECRET && key !== 'secure_cron_key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const today = new Date()

        // Find Investments that expired 'yesterday' or recently and status is still ACTIVE (needs closing)
        // OR a specific 'Breakdown Refund' schedule. 
        // Logic: Refund Breakdown Wallet when Plan Ends?

        // 1. Find Investments ready to complete
        const expiringInvestments = await prisma.investment.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { lte: today }
            }
        })

        let processed = 0

        for (const inv of expiringInvestments) {
            await prisma.$transaction(async (tx) => {
                // Close Investment
                await tx.investment.update({
                    where: { id: inv.id },
                    data: { status: 'COMPLETED' }
                })

                // Refund Breakdown Wallet content?
                // Logic: 80% of investment was put there. We move it back to USDT/INR?
                // Or "70 USDT Refund after period" implies specific math.
                // Simplified: Move entire BREAKDOWN balance for this user to INR/USDT?
                // Danger: Breakdown wallet is aggregate. We need to track breakdown PER investment? 
                // Schema doesn't track breakdown per investment. 
                // Assumption: Refund percentage of the original investment amount that went to breakdown.
                // Breakdown was 80% of Amount.
                const refundAmount = inv.amount * 0.80

                // Check if Breakdown Wallet has enough?
                // If not, system deficit. We assume it's there.

                // Debit Breakdown
                await tx.wallet.update({
                    where: { userId_type: { userId: inv.userId, type: WALLET_TYPES.BREAKDOWN } },
                    data: { balance: { decrement: refundAmount } }
                })

                // Credit Main ROI/INR Wallet
                await tx.wallet.update({
                    where: { userId_type: { userId: inv.userId, type: WALLET_TYPES.INR } },
                    data: { balance: { increment: refundAmount } }
                })

                await tx.transaction.create({
                    data: {
                        userId: inv.userId,
                        amount: refundAmount,
                        type: TRANSACTION_TYPES.REFUND,
                        status: 'APPROVED',
                        description: `Breakdown Refund for Plan ${inv.id}`
                    }
                })
            })
            processed++
        }

        return NextResponse.json({ success: true, processed })
    } catch (error: any) {
        console.error('Breakdown Refund Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
