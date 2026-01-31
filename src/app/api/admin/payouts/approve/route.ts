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
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { transactionId, action, txHash } = body // action: 'APPROVE' or 'REJECT'

        if (!transactionId || !action) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } })
        if (!transaction || transaction.status !== 'PENDING') {
            return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 })
        }

        if (action === 'REJECT') {
            await prisma.$transaction(async (tx) => {
                // Refund Balance
                // We need to know which wallet type to refund to.
                // Assuming it was deducted from same type as description implies or stored.
                // Transaction schema: type=WITHDRAWAL.
                // We need to infer wallet type.
                const type = transaction.description?.includes('USDT') ? 'USDT' : 'INR'

                await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'FAILED' }
                })

                await tx.wallet.update({
                    where: { userId_type: { userId: transaction.userId, type: type } },
                    data: { balance: { increment: transaction.amount } }
                })
            })
            return NextResponse.json({ success: true, message: 'Withdrawal rejected & refunded' })
        }

        if (action === 'APPROVE') {
            await prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    status: 'APPROVED',
                    txId: txHash || transaction.txId // Update with real Blockchain Hash if provided
                }
            })
            // Funds were already deducted at Request time.
            return NextResponse.json({ success: true, message: 'Withdrawal approved' })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Payout Approval Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
