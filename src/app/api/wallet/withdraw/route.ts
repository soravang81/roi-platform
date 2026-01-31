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
        const { amount, type, address } = body // type: 'USDT' or 'INR'

        if (!amount || !type || !address) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const val = parseFloat(amount)
        if (isNaN(val) || val <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

        // Check Balance
        const wallet = await prisma.wallet.findUnique({
            where: { userId_type: { userId, type } }
        })

        if (!wallet || wallet.balance < val) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
        }

        // Create PENDING Withdrawal
        await prisma.$transaction(async (tx) => {
            // Deduct Balance Immediately (Lock funds)
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: val } }
            })

            await tx.transaction.create({
                data: {
                    userId,
                    amount: val,
                    type: 'WITHDRAWAL',
                    status: 'PENDING',
                    description: `Withdrawal to ${address}`,
                    txId: 'PENDING' // Placeholder
                }
            })
        })

        return NextResponse.json({ success: true, message: 'Withdrawal requested' })

    } catch (error: any) {
        console.error('Withdrawal Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
