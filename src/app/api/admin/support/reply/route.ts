import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const { ticketId, message, status } = body

        if (!ticketId || !message) {
            return NextResponse.json({ error: 'Missing ticketId or message' }, { status: 400 })
        }

        // Add Message
        await prisma.ticketMessage.create({
            data: {
                ticketId,
                userId: payload.userId, // Admin ID
                message
            }
        })

        // Update Status?
        if (status) { // e.g., 'RESOLVED', 'CLOSED'
            await prisma.supportTicket.update({
                where: { id: ticketId },
                data: { status }
            })
        }

        return NextResponse.json({ success: true, message: 'Replied to ticket' })

    } catch (error: any) {
        console.error('Support Reply Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
