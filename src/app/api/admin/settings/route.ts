import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// Use a singleton ID
const CONFIG_ID = 'CONFIG'

export async function GET(req: Request) {
    try {
        let config = await prisma.systemConfig.findUnique({ where: { id: CONFIG_ID } })
        if (!config) {
            // seed default
            config = await prisma.systemConfig.create({
                data: { id: CONFIG_ID }
            })
        }
        return NextResponse.json({ config })
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
        if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const body = await req.json()
        const { siteName, supportEmail, logoUrl } = body

        const config = await prisma.systemConfig.upsert({
            where: { id: CONFIG_ID },
            update: { siteName, supportEmail, logoUrl },
            create: { id: CONFIG_ID, siteName, supportEmail, logoUrl }
        })

        return NextResponse.json({ message: 'Settings Updated', config })

    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
