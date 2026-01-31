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
        const { docId, action, remarks } = body // action: 'APPROVE', 'REJECT'

        if (!docId || !action) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const doc = await prisma.kYCDoc.findUnique({ where: { id: docId } })
        if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

        await prisma.$transaction(async (tx) => {
            // Update Doc Status
            await tx.kYCDoc.update({
                where: { id: docId },
                data: { status: newStatus }
            })

            // Check if all user docs are approved? 
            // Simplified: If this one is approved, mark user as VERIFIED? 
            // Or requires strict checking. 
            // Let's say if action is APPROVE, we verify the user for MVP.
            if (action === 'APPROVE') {
                await tx.user.update({
                    where: { id: doc.userId },
                    data: {
                        kycStatus: 'APPROVED',
                        isVerified: true
                    }
                })
            } else {
                await tx.user.update({
                    where: { id: doc.userId },
                    data: { kycStatus: 'REJECTED' }
                })
            }
        })

        return NextResponse.json({ success: true, message: `KYC ${action}D` })

    } catch (error: any) {
        console.error('KYC Verify Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
