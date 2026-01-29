import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const userId = payload.userId
        const isAdmin = payload.role === 'ADMIN'

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const targetUserId = searchParams.get('userId')

        // Authorization Check
        // If targetUserId is provided and different from requesting userId, must be ADMIN
        let queryUserId = userId
        if (targetUserId) {
            if (targetUserId !== userId && !isAdmin) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }
            queryUserId = targetUserId
        } else if (isAdmin && searchParams.has('all')) {
            // Admin viewing ALL transactions (Global view)
            queryUserId = undefined as any // Prisma filter: undefined means no filter on this field
        }

        const skip = (page - 1) * limit

        const where: any = {}
        if (queryUserId) where.userId = queryUserId
        if (type && type !== 'ALL') where.type = type
        if (status && status !== 'ALL') where.status = status

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, email: true } } } // Useful for Admin
            }),
            prisma.transaction.count({ where })
        ])

        return NextResponse.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error: any) {
        console.error('Transactions API Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { id, status } = body

        if (!id || !['APPROVED', 'FAILED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        // Atomic Transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { id } })
            if (!transaction) throw new Error('Transaction not found')

            if (transaction.status !== 'PENDING') throw new Error('Transaction already processed')

            // Update Status
            const updatedTx = await tx.transaction.update({
                where: { id },
                data: { status }
            })

            // Handle Balance Effects
            if (transaction.type === 'DEPOSIT' && status === 'APPROVED') {
                // Parse Wallet Type from Description (e.g. "Deposit USDT - ...")
                // Fallback to INR if parsing fails, but try to be smart.
                let walletType = 'INR'
                if (transaction.description?.includes('USDT')) walletType = 'USDT'
                // Add more currencies if needed

                // Credit Wallet
                await tx.wallet.upsert({
                    where: { userId_type: { userId: transaction.userId, type: walletType } },
                    update: { balance: { increment: transaction.amount } },
                    create: {
                        userId: transaction.userId,
                        type: walletType,
                        balance: transaction.amount,
                        currency: walletType
                    }
                })
            } else if (transaction.type === 'WITHDRAWAL' && status === 'FAILED') {
                // Refund Wallet (Withdrawals deduct on request, so verify failure -> refund)
                let walletType = 'INR'
                // Description format: "Withdraw USDT to ..."
                if (transaction.description?.includes('USDT')) walletType = 'USDT'

                await tx.wallet.update({
                    where: { userId_type: { userId: transaction.userId, type: walletType } },
                    data: { balance: { increment: transaction.amount } }
                })
            }

            return updatedTx
        })

        return NextResponse.json({ success: true, transaction: result })

    } catch (error: any) {
        console.error('Transaction Update Error:', error)
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 })
    }
}
