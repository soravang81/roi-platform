import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET: List all plans
export async function GET() {
    try {
        const plans = await prisma.investmentPlan.findMany({
            orderBy: { minAmount: 'asc' },
        })
        return NextResponse.json({ plans }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

// POST: Create New Plan
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        // Check Admin...

        const body = await req.json()
        const { name, minAmount, maxAmount, roiPercent, duration, roiFrequency, description, currency } = body

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
                description,
                currency: currency || 'USDT',
                isActive: true
            }
        })

        return NextResponse.json({ message: 'Plan created', plan }, { status: 201 })
    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
