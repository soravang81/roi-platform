import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const plans = await prisma.investmentPlan.findMany({
            where: { isActive: true },
            orderBy: { minAmount: 'asc' },
        })
        return NextResponse.json({ plans }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
