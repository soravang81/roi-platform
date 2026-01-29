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

        const where: any = {}
        if (payload.role !== 'ADMIN') {
            where.userId = payload.userId
        }

        // Admins see all by default, or filter?
        // Let's keep it simple: Admins see all. Users see theirs.

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        })

        return NextResponse.json({ tickets })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const body = await req.json()
        const { subject, message } = body

        if (!subject || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: payload.userId,
                subject,
                messages: {
                    create: {
                        userId: payload.userId,
                        message
                    }
                }
            }
        })

        return NextResponse.json({ ticket })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
