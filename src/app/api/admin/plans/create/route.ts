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
        const { name, minAmount, maxAmount, roiPercent, duration, roiFrequency, currency } = body

        if (!name || !minAmount || !roiPercent || !duration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const plan = await prisma.investmentPlan.create({
            data: {
                name,
                minAmount: parseFloat(minAmount),
                maxAmount: maxAmount ? parseFloat(maxAmount) : null,
                roiPercent: parseFloat(roiPercent),
                duration: parseInt(duration),
                roiFrequency: roiFrequency || 'DAILY',
                currency: currency || 'USDT',
                isActive: true
            }
        })

        return NextResponse.json({ success: true, plan })

    } catch (error: any) {
        console.error('Create Plan Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
