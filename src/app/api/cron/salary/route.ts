import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SYSTEM_CONFIG } from '@/lib/config'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (key !== process.env.CRON_SECRET && key !== 'secure_cron_key') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Iterate all users who are NOT yet salary active
        const users = await prisma.user.findMany({
            where: { salaryActive: false },
            include: {
                referees: {
                    select: {
                        id: true,
                        createdAt: true,
                        investments: { select: { id: true } } // needed to check if Paid
                    }
                }
            }
        })

        let qualifiedCount = 0

        for (const user of users) {
            const joinDate = new Date(user.createdAt).getTime()
            // 72 hours in ms
            const limitTime = joinDate + (SYSTEM_CONFIG.SALARY.QUALIFICATION_HOURS * 60 * 60 * 1000)

            // Filter referrals made within 72 hours (Wait, is it within *User's* joining or *Referral's* joining? 
            // "User qualifies with... within 72 hours". Usually means within 72 hours of USER joining.)
            // Let's assume 72h from User Registration.

            // Check if 72 hours have passed or we are still checking?
            // If 72h passed and they didn't qualify, they never will (unless reset).
            // We can check regardless.

            const validTimeReferrals = user.referees.filter(ref =>
                new Date(ref.createdAt).getTime() <= limitTime
            )

            // Count Paid vs Free
            const paidReferrals = validTimeReferrals.filter(ref => ref.investments.length > 0).length
            const freeReferrals = validTimeReferrals.length // Total (Free includes Paid in this context usually, or separate?)
            // "10 Free Users" usually means strictly free or just total count. Let's use Total Count.

            let qualified = false
            if (paidReferrals >= SYSTEM_CONFIG.SALARY.PAID_USER_TARGET) qualified = true
            if (freeReferrals >= SYSTEM_CONFIG.SALARY.FREE_USER_TARGET) qualified = true

            if (qualified) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { salaryActive: true }
                })
                qualifiedCount++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed Salary Checks. Newly Qualified: ${qualifiedCount}`
        })

    } catch (error: any) {
        console.error('Cron Salary Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
