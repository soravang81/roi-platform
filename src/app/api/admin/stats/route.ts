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
        if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        // 1. Total Users
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } })

        // 2. Pending KYC
        const pendingKyc = await prisma.user.count({ where: { kycStatus: 'PENDING' } })

        // 3. Total Deposits (Approved)
        const deposits = await prisma.transaction.aggregate({
            where: { type: 'DEPOSIT', status: 'APPROVED' },
            _sum: { amount: true }
        })

        // 4. Pending Withdrawals
        const pendingWithdrawals = await prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } })

        // 5. Recent Transactions
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        })

        return NextResponse.json({
            totalUsers,
            pendingKyc,
            totalDeposits: deposits._sum.amount || 0,
            pendingWithdrawals,
            recentTransactions
        })

    } catch (error: any) {
        console.error("Stats Error:", error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
