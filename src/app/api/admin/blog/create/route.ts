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
        const { title, slug, content, author, categoryId, isPublished } = body

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existing = await prisma.blogPost.findUnique({ where: { slug } })
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                author: author || 'Admin',
                categoryId,
                isPublished: isPublished || false
            }
        })

        return NextResponse.json({ success: true, post })

    } catch (error: any) {
        console.error('Create Blog Post Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    // Similar logic for Update
    // For brevity, handling only Create in this file or use Dynamic Route [id]?
    // Let's assume this route is for Create. UPDATE usually goes to /api/admin/blog/[id]/route.ts
    return NextResponse.json({ error: 'Use PATCH /api/admin/blog/[id]' }, { status: 405 })
}
