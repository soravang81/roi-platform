import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET Ticket Details + Messages
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const { id } = params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                messages: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
                user: { select: { name: true, email: true } }
            }
        })

        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (payload.role !== 'ADMIN' && ticket.userId !== payload.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ ticket })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error: ' + error.message }, { status: 500 })
    }
}

// POST new message (Reply)
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const { id } = params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const body = await req.json()
        const { message, status } = body

        const ticket = await prisma.supportTicket.findUnique({ where: { id } })
        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (payload.role !== 'ADMIN' && ticket.userId !== payload.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Add Message
        if (message) {
            await prisma.ticketMessage.create({
                data: {
                    ticketId: id,
                    userId: payload.userId,
                    message
                }
            })
        }

        // Update Status (e.g. Admin closing or marking resolved)
        if (status && payload.role === 'ADMIN') {
            await prisma.supportTicket.update({
                where: { id },
                data: { status }
            })
        }

        // Touch ticket updated at
        await prisma.supportTicket.update({ where: { id }, data: { updatedAt: new Date() } })

        return NextResponse.json({ message: 'Replied' })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
