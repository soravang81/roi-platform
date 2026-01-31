import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { SYSTEM_CONFIG, TRANSACTION_TYPES, WALLET_TYPES } from '@/lib/config'
import { distributeReferralCommission } from '@/lib/referrals'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const userId = payload.userId

        const body = await req.json()
        const { planId, amount, walletType } = body

        if (!planId || !amount || !walletType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } })
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

        if (amount < plan.minAmount) {
            return NextResponse.json({ error: `Minimum investment is ${plan.minAmount}` }, { status: 400 })
        }
        if (plan.maxAmount && amount > plan.maxAmount) {
            return NextResponse.json({ error: `Maximum investment is ${plan.maxAmount}` }, { status: 400 })
        }

        // --- TRANSACTION START ---
        // Using prisma.$transaction for atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Check Balance & Debit
            const wallet = await tx.wallet.findUnique({
                where: { userId_type: { userId, type: walletType } }
            })

            if (!wallet || wallet.balance < amount) {
                throw new Error('Insufficient balance')
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            })

            await tx.transaction.create({
                data: {
                    userId,
                    amount: amount,
                    type: TRANSACTION_TYPES.PLAN_PURCHASE, // or 'DEBIT' specific?
                    status: 'APPROVED',
                    description: `Purchase Plan: ${plan.name}`
                }
            })

            // 2. Breakdown Logic (80% Credit to Breakdown Wallet)
            const breakdownAmount = amount * SYSTEM_CONFIG.BREAKDOWN_PERCENTAGE

            // Upsert Breakdown Wallet
            await tx.wallet.upsert({
                where: { userId_type: { userId, type: WALLET_TYPES.BREAKDOWN } },
                update: { balance: { increment: breakdownAmount } },
                create: {
                    userId,
                    type: WALLET_TYPES.BREAKDOWN,
                    balance: breakdownAmount,
                    currency: 'INR' // or match plan currency?
                }
            })

            await tx.transaction.create({
                data: {
                    userId,
                    amount: breakdownAmount,
                    type: TRANSACTION_TYPES.BREAKDOWN_CREDIT,
                    status: 'APPROVED',
                    description: `breakdown credit (80% of ${amount})`
                }
            })

            // 3. Create Investment
            await tx.investment.create({
                data: {
                    userId,
                    planId,
                    amount,
                    status: 'ACTIVE',
                    endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
                }
            })

            // 4. Update User Stats (Direct Business? No, that's for referrer)
            // But we might want to mark user as active/verified if first investment?
            // Optional: tx.user.update(...)

        })
        // --- TRANSACTION END ---

        // 5. Post-Transaction: Distribute Commissions (Non-blocking for user response? Or blocking?)
        // Better blocking to ensure it happens, but outside the main transaction to avoid lock contention if huge?
        // For safety, let's await it.
        await distributeReferralCommission(userId, amount)

        return NextResponse.json({ success: true, message: 'Investment successful' })

    } catch (error: any) {
        console.error('Buy Plan Error:', error)
        if (error.message === 'Insufficient balance') {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
