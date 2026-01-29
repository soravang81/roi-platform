import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                name: true,
                email: true,
                mobile: true,
                kycStatus: true,
                kycDocument: true
            }
        })

        return NextResponse.json({ user })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const body = await req.json()
        const { password, kycDocument } = body

        const data: any = {}
        if (password) {
            data.password = await hashPassword(password)
        }
        if (kycDocument) {
            data.kycDocument = kycDocument
            data.kycStatus = 'PENDING' // Reset to pending on new upload
        }

        const user = await prisma.user.update({
            where: { id: payload.userId },
            data,
            select: { id: true, kycStatus: true }
        })

        return NextResponse.json({ message: 'Profile Updated', user })

    } catch (error: any) {
        console.error("Profile Update Error:", error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
