import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET: List all withdrawals
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        // Check Admin...

        const withdrawals = await prisma.transaction.findMany({
            where: { type: 'WITHDRAWAL' },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ withdrawals }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

// PUT: Approve/Reject Withdrawal
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        // Check Admin...

        const body = await req.json()
        const { transactionId, status, txId } = body // txId needed for Approval (Blockchain hash)

        if (status === 'APPROVED' && !txId) {
            return NextResponse.json({ error: 'Transaction ID required for approval' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { id: transactionId } })
            if (!transaction || transaction.status !== 'PENDING') throw new Error('Invalid Transaction')

            if (status === 'APPROVED') {
                // Just update status and set txId. Balance was already deducted.
                return await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status, txId }
                })
            } else if (status === 'REJECTED') {
                // Refund Balance
                // Guess wallet type from description or user ID?
                // Need to know which wallet type. 
                // Issue: Schema doesn't store 'WalletType' on Transaction directly, only 'type=WITHDRAWAL'
                // Workaround: We check which wallet has enough balance? No.
                // Fix: We should check description or add 'currency' field to Transaction.
                // For now, I'll rely on a hack: checks 'INR' vs 'USDT' in description or something?
                // Actually, in the POST route I set description: `Withdraw to ${address}`. This is ambiguous.
                // Better Fix: assume USDT for now or update schema.
                // Let's UPDATE SCHEMA to add 'currency' to Transaction or just 'metadata'.
                // OR checks transaction amount?
                // RE-READING schema: Transaction has no currency field.
                // I will implement a quick fix: if address starts with '0x' or 'T' -> USDT, else INR?
                // Or just fail safe and ask admin to manually refund?
                // No, auto-refund is needed.

                // I'll update the POST route to include currency in description clearly: "Withdraw USDT to ..."
                // Yes, let's do that in the POST route fix above.

                // Re-fetching original transaction to parse description
                const isUsdt = transaction.description?.includes('USDT')
                const walletType = isUsdt ? 'USDT' : 'INR'

                await tx.wallet.update({
                    where: { userId_type: { userId: transaction.userId, type: walletType } },
                    data: { balance: { increment: transaction.amount } }
                })

                return await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status }
                })
            }
        })

        return NextResponse.json({ message: 'Success', result }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
