import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET: List all deposits
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        // In real app, check if payload.role === 'ADMIN'

        const deposits = await prisma.transaction.findMany({
            where: { type: 'DEPOSIT' },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ deposits }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT: Approve or Reject
export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        // Check Admin Role here

        const body = await req.json()
        const { transactionId, status } = body // status: 'APPROVED' | 'REJECTED'

        if (!transactionId || !['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid Request' }, { status: 400 })
        }

        // Atomic Transaction
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { id: transactionId } })
            if (!transaction) throw new Error('Transaction not found')

            if (transaction.status !== 'PENDING') throw new Error('Transaction already processed')

            // Update Transaction Status
            const updatedTx = await tx.transaction.update({
                where: { id: transactionId },
                data: { status }
            })

            // If Approved, Credit Wallet
            if (status === 'APPROVED') {
                // Determine Wallet Type from description or add a field in Schema. 
                // For now, simple heuristics: if description contains 'USDT', credit USDT wallet.
                const isUsdt = transaction.description?.includes('USDT')
                const walletType = isUsdt ? 'USDT' : 'INR'

                await tx.wallet.update({
                    where: {
                        userId_type: { userId: transaction.userId, type: walletType }
                    },
                    data: {
                        balance: { increment: transaction.amount }
                    }
                })
            }

            return updatedTx
        })

        return NextResponse.json({ message: `Deposit ${status}`, result }, { status: 200 })

    } catch (error: any) {
        console.error('Admin Deposit Error:', error)
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 })
    }
}
