import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const { id } = params
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const body = await req.json()
        const { action } = body // 'BLOCK', 'UNBLOCK', 'APPROVE_KYC', 'REJECT_KYC'

        const updateData: any = {}
        if (action === 'BLOCK') updateData.isBlocked = true
        if (action === 'UNBLOCK') updateData.isBlocked = false
        if (action === 'APPROVE_KYC') updateData.kycStatus = 'APPROVED'
        if (action === 'REJECT_KYC') updateData.kycStatus = 'REJECTED'

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ message: 'User updated', user: updatedUser })

    } catch (error: any) {
        console.error("Admin User Action Error:", error)
        return NextResponse.json({ error: 'Server Error: ' + error.message }, { status: 500 })
    }
}
