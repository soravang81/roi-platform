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

        const deposits = await prisma.transaction.findMany({
            where: {
                type: 'DEPOSIT', // Matches what we set in Request
                status: 'PENDING'
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ deposits })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
