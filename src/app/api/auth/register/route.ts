import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, mobile, password, referralCode } = body

        if (!password || (!email && !mobile)) {
            return NextResponse.json(
                { error: 'Email/Mobile and Password are required' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { mobile: mobile || undefined },
                ],
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or mobile already exists' },
                { status: 409 }
            )
        }

        // Handle Referral
        let referrerId = null
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode },
            })
            if (referrer) {
                referrerId = referrer.id
            }
        }

        // Generate own referral code
        const newReferralCode = uuidv4().slice(0, 8).toUpperCase()

        const hashedPassword = await hashPassword(password)

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                referralCode: newReferralCode,
                referrerId,
                wallets: {
                    create: [
                        { type: 'INR', currency: 'INR' },
                        { type: 'USDT', currency: 'USDT' },
                        { type: 'ROI', currency: 'USDT' },
                        { type: 'SALARY', currency: 'USDT' },
                        { type: 'BREAKDOWN', currency: 'USDT' },
                    ],
                },
            },
        })

        return NextResponse.json(
            { message: 'User registered successfully', user: newUser },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Registration Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
