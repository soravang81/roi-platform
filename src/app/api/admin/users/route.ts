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

        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''

        const where: any = {}
        if (search) {
            where.OR = [
                { email: { contains: search } },
                { name: { contains: search } },
                { id: { contains: search } }
            ]
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                kycStatus: true,
                kycDocument: true,
                isBlocked: true,
                createdAt: true,
                // Include balances? Expensive but useful.
                // Or just fetch basic info.
            },
            take: 50
        })

        return NextResponse.json({ users })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
