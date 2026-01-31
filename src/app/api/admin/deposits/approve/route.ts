import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { WALLET_TYPES } from '@/lib/config'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { transactionId, action } = body // action: 'APPROVE' or 'REJECT'

        if (!transactionId || !action) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
        if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

        if (transaction.status !== 'PENDING') {
            return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 })
        }

        if (action === 'REJECT') {
            await prisma.transaction.update({
                where: { id: transactionId },
                data: { status: 'FAILED' } // or REJECTED
            })
            return NextResponse.json({ success: true, message: 'Deposit rejected' })
        }

        if (action === 'APPROVE') {
            await prisma.$transaction(async (tx) => {
                // 1. Update Transaction
                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'APPROVED' }
                })

                // 2. Credit Wallet
                // Determine wallet type from transaction description or context? 
                // Schema Transaction doesn't have 'currency' or 'walletType' explicitly, 
                // but usually Deposit request implies a specific wallet.
                // Let's assume description contains 'USDT' or 'INR' OR we add a field.
                // For now, default to INR if not specified, or key off something.
                // Ideally schema should have 'currency' in Transaction.
                // Let's assume we pass `walletType` in body for safety, OR valid system knows.
                // Fallback: Check if user has wallet?

                // HACK: For MVP, assume INR unless description says USDT.
                const type = (transaction.description?.includes('USDT')) ? WALLET_TYPES.USDT : WALLET_TYPES.INR

                await tx.wallet.upsert({
                    where: { userId_type: { userId: transaction.userId, type: type } },
                    update: { balance: { increment: transaction.amount } },
                    create: {
                        userId: transaction.userId,
                        type: type,
                        balance: transaction.amount,
                        currency: type
                    }
                })
            })

            return NextResponse.json({ success: true, message: 'Deposit approved and wallet credited' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Admin Deposit Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
