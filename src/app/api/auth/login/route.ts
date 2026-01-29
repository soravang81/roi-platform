import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { serialize } from 'cookie'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, mobile, password } = body

        if ((!email && !mobile) || !password) {
            return NextResponse.json(
                { error: 'Email/Mobile and Password are required' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { mobile: mobile || undefined },
                ],
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate Token
        const token = signToken({ userId: user.id, role: user.role })

        // Set Cookie
        const cookie = serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'strict',
        })

        const response = NextResponse.json(
            { message: 'Login successful', user: { id: user.id, name: user.name, role: user.role, referralCode: user.referralCode } },
            { status: 200 }
        )

        response.headers.set('Set-Cookie', cookie)

        return response
    } catch (error: any) {
        console.error('Login Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
