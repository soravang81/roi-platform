import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
                author: true,
                content: true // We might want to truncate this for list, but for MVP fetching all is fine
            }
        })
        return NextResponse.json({ posts })
    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
