import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const userId = payload.userId

        const body = await req.json()
        const { planId, amount } = body

        if (!planId || !amount) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const investAmount = parseFloat(amount)

        // 1. Fetch Plan & Wallet
        const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } })
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

        // Check limits
        if (investAmount < plan.minAmount || (plan.maxAmount && investAmount > plan.maxAmount)) {
            return NextResponse.json({ error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount || '∞'}` }, { status: 400 })
        }

        // Determine Wallet Type from Plan Currency
        // Default to USDT if not set (backward compat)
        const walletType = (plan as any).currency || 'USDT'

        const wallet = await prisma.wallet.findUnique({
            where: { userId_type: { userId, type: walletType } }
        })

        if (!wallet || wallet.balance < investAmount) {
            return NextResponse.json({ error: `Insufficient ${walletType} balance` }, { status: 400 })
        }

        // 2. Execute Transaction
        // Logic: 
        // - Deduct investAmount from Main Wallet
        // - Credit investAmount * 0.80 to Breakdown Wallet
        // - Create Investment Record (for full investAmount)

        const breakdownAmount = investAmount * 0.80

        const result = await prisma.$transaction(async (tx) => {
            // Deduct Main
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: investAmount } }
            })

            // Credit Breakdown
            // Find or create breakdown wallet? It should exist from registration.
            await tx.wallet.update({
                where: { userId_type: { userId, type: 'BREAKDOWN' } },
                data: { balance: { increment: breakdownAmount } }
            })

            // Create Investment
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + plan.duration)

            const investment = await tx.investment.create({
                data: {
                    userId,
                    planId,
                    amount: investAmount,
                    startDate: new Date(),
                    endDate: endDate,
                    status: 'ACTIVE',
                    roiEarned: 0
                }
            })

            // Log Transactions
            await tx.transaction.createMany({
                data: [
                    {
                        userId,
                        amount: investAmount,
                        type: 'INVESTMENT_DEBIT',
                        status: 'APPROVED',
                        description: `Invested in ${plan.name}`
                    },
                    {
                        userId,
                        amount: breakdownAmount,
                        type: 'BREAKDOWN_CREDIT',
                        status: 'APPROVED',
                        description: `Breakdown credit (80%) for investment`
                    }
                ]
            })


            // --- REFERRAL LOGIC ---
            // 1. Update Referrer
            const user = await tx.user.findUnique({ where: { id: userId }, select: { referrerId: true } })

            if (user?.referrerId) {
                const referrerId = user.referrerId

                // Increment Direct Business (Using Raw SQL to bypass potential stale client types)
                await tx.$executeRaw`UPDATE User SET directBusiness = directBusiness + ${investAmount} WHERE id = ${referrerId}`

                // Fetch updated user to check salary
                // We use raw query or findUnique (findUnique might return stale data if cached? No, usually fresh).
                // But fields might be missing in type.
                // Let's use raw query for check too or just logic.

                // Fetch check
                const [refUser]: any = await tx.$queryRaw`SELECT directBusiness, salaryActive FROM User WHERE id = ${referrerId}`

                if (refUser && refUser.directBusiness >= 50000 && !refUser.salaryActive) {
                    await tx.$executeRaw`UPDATE User SET salaryActive = 1 WHERE id = ${referrerId}`
                }

                const referralBonus = investAmount * 0.05

                await tx.wallet.upsert({
                    where: { userId_type: { userId: referrerId, type: 'ROI' } },
                    update: { balance: { increment: referralBonus } },
                    create: { userId: referrerId, type: 'ROI', balance: referralBonus }
                })

                await tx.transaction.create({
                    data: {
                        userId: referrerId,
                        amount: referralBonus,
                        type: 'REFERRAL',
                        status: 'APPROVED',
                        description: `5% Referral Bonus`
                    }
                })
            }

            return investment
        })

        return NextResponse.json({ message: 'Investment successful', result }, { status: 201 })

    } catch (error: any) {
        console.error('Purchase Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
