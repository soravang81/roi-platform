import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload: any = verifyToken(token.value)
        if (!payload?.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await req.json()
        const { amount, type, description, txId } = body // type: 'INR' or 'USDT'

        if (!amount || !type || !description) {
            return NextResponse.json(
                { error: 'Amount, Type, and Reference ID (UTR/TxHash) are required' },
                { status: 400 }
            )
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: payload.userId,
                amount: parseFloat(amount),
                type: 'DEPOSIT',
                status: 'PENDING',
                txId: txId || description, // Use description as txId for now if txId not explicitly sent
                description: `Deposit ${type} - ${description}`,
            },
        })

        return NextResponse.json({ message: 'Deposit request submitted', transaction }, { status: 201 })
    } catch (error: any) {
        console.error('Deposit Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
