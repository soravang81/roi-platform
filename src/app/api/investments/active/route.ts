import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)

        const investments = await prisma.investment.findMany({
            where: { userId: payload.userId },
            include: { plan: true },
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json({ investments }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
