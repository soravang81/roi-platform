import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

        const post = await prisma.blogPost.findUnique({
            where: { slug }
        })

        if (!post || !post.isPublished) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json({ post })
    } catch (error: any) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
