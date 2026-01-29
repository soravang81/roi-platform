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

        const body = await req.json()
        const { amount, type, address } = body // type: 'INR' or 'USDT'

        if (!amount || !type || !address) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const withdrawAmount = parseFloat(amount)

        // Check Balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId_type: { userId: payload.userId, type: type } }
        })

        if (!wallet || wallet.balance < withdrawAmount) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
        }

        // Atomic Transaction: Deduct Balance + Create Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: withdrawAmount } }
            })

            // Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId: payload.userId,
                    amount: withdrawAmount,
                    type: 'WITHDRAWAL',
                    status: 'PENDING',
                    description: `Withdraw ${type} to ${address}`,
                    txId: null // Pending admin txId
                }
            })
            return transaction
        })

        return NextResponse.json({ message: 'Withdrawal submitted', result }, { status: 201 })
    } catch (error: any) {
        console.error('Withdraw Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
