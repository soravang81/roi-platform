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
        const userId = payload.userId

        const body = await req.json()
        const { type, url } = body // e.g., 'AADHAAR', 'https://...'

        if (!type || !url) {
            return NextResponse.json({ error: 'Missing type or url' }, { status: 400 })
        }

        // Create KYC Doc record
        await prisma.kYCDoc.create({
            data: {
                userId,
                type,
                url,
                status: 'PENDING'
            }
        })

        // Update User Status to PENDING
        await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: 'PENDING' }
        })

        return NextResponse.json({ success: true, message: 'KYC Document submitted' })

    } catch (error: any) {
        console.error('KYC Submit Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
