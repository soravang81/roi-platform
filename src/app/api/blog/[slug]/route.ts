import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const slug = params.slug
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
