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
        const { targetUserId, role } = body // 'STAFF', 'DISTRIBUTOR', 'ADMIN'

        if (!targetUserId || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const validRoles = ['USER', 'STAFF', 'ADMIN', 'DISTRIBUTOR']
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { role }
        })

        return NextResponse.json({ success: true, message: `User role updated to ${role}` })

    } catch (error: any) {
        console.error('Role Update Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
