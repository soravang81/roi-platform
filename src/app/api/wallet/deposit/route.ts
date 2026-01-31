import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { TRANSACTION_TYPES } from '@/lib/config'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const userId = payload.userId

        const body = await req.json()
        const { amount, type, description } = body // type: 'INR' or 'USDT'

        if (!amount || !type || !description) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 })
        }

        // Validate Amount
        const val = parseFloat(amount)
        if (isNaN(val) || val <= 0) return NextResponse.json({ error: 'Invalid Amount' }, { status: 400 })

        // Create PENDING Transaction
        await prisma.transaction.create({
            data: {
                userId,
                amount: val,
                type: 'DEPOSIT', // Ensure this matches TRANSACTION_TYPES.DEPOSIT
                status: 'PENDING',
                description: `${type} Deposit: ${description}`,
                txId: description // Storing UTR/Hash as txId
            }
        })

        return NextResponse.json({ success: true, message: 'Deposit Request Submitted' })

    } catch (error: any) {
        console.error('Deposit Request Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
