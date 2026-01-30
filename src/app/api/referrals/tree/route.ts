import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// Recursive function to build tree
async function buildTree(userId: string, depth: number = 0, maxDepth: number = 3): Promise<any[]> {
    if (depth >= maxDepth) return []

    const directs = await prisma.user.findMany({
        where: { referrerId: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            kycStatus: true,
            // @ts-ignore
            directBusiness: true,
            investments: {
                where: { status: 'ACTIVE' },
                select: { amount: true }
            }
        }
    })

    // Parallelize recursive calls? For deep trees this is dangerous.
    // For V1, let's just do it sequentially or use a single query with include if depth is small.
    // Prisma doesn't support recursive include easily for indefinite depth.
    // Manually fetching.

    const tree = []
    for (const direct of directs) {
        const children = await buildTree(direct.id, depth + 1, maxDepth)
        const selfInvestment = direct.investments.reduce((sum, inv) => sum + inv.amount, 0)

        tree.push({
            ...direct,
            selfInvestment,
            children
        })
    }

    return tree
}

// Optimized approach: Fetch all descendants in one go if possible?
// SQLite doesn't have recursive CTEs easily accessible via Prisma without Raw.
// For now, let's use the recursive function but keep maxDepth small (e.g., 3).

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const payload: any = verifyToken(token.value)
        const userId = payload.userId

        // Check if query param 'userId' is provided (for Admin or drilling down)
        const url = new URL(req.url)
        const targetId = url.searchParams.get('targetId') || userId

        // Security: Users can only view their own downline. 
        // If targetId != userId, check if targetId is in userId's downline? 
        // OR just allow viewing anyone if Admin?
        const isAdmin = payload.role === 'ADMIN'
        if (targetId !== userId && !isAdmin) {
            // Simple check: Allow if targetId is *the user* (already checked) or if we implement drill-down security later.
            // For now, restrict to own tree unless Admin.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // 1. Stats
        // Directs Count
        const directsCount = await prisma.user.count({ where: { referrerId: targetId } })

        // Team Size (Recursive count - Expensive)
        // Let's just return Directs for now in stats, and maybe "Volume".
        // "Direct Business" is already stored on the User model!
        const userNode = await prisma.user.findUnique({
            where: { id: targetId },
            // @ts-ignore
            select: { directBusiness: true, referralCode: true }
        })

        const tree = await buildTree(targetId, 0, 3) // 3 Levels deep

        return NextResponse.json({
            stats: {
                directs: directsCount,
                directVolume: userNode?.directBusiness || 0,
                referralCode: userNode?.referralCode
            },
            tree
        })

    } catch (error: any) {
        console.error('Referral Tree Error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
