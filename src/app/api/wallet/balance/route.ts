import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload: any = verifyToken(token.value)
        if (!payload?.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const wallets = await prisma.wallet.findMany({
            where: { userId: payload.userId },
        })

        // Format as an object { INR: 0, USDT: 0, ... }
        const formatted: Record<string, number> = {}
        wallets.forEach((w) => {
            formatted[w.type] = w.balance
        })

        return NextResponse.json({ balances: formatted, raw: wallets }, { status: 200 })
    } catch (error: any) {
        console.error('Balance Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
