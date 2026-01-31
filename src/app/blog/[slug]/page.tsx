'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default function BlogPostPage() {
    const params = useParams()
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // We need a slug fetcher. 
        // I'll assume fetching /api/blog?slug=... or create `api/blog/[slug]`
        // Actually, let's create `api/blog/[slug]` for cleaner arch.
        // For now, I'll filter client side from list if I have to, but creating [slug] route is better.
        // Let's call /api/blog/[slug]
        if (params?.slug) {
            fetch(`/api/blog/${params.slug}`)
                .then(res => res.json())
                .then(data => {
                    if (data.post) setPost(data.post)
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }
    }, [params?.slug])

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Loading post...</div>
    if (!post) return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Post not found or unavailable.</div>

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <div className="container" style={{ maxWidth: '800px', padding: '8rem 2rem 4rem' }}>
                <Link href="/blog" style={{ opacity: 0.7, textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>← Back to Blog</Link>
                <article className="glass-panel" style={{ padding: '3rem' }}>
                    <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
                        <h1 className="heading-xl text-gradient" style={{ marginBottom: '1rem', lineHeight: '1.2' }}>{post.title}</h1>
                        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6, fontSize: '0.9rem' }}>
                            <span>By {post.author}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </header>

                    <div style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)' }}>
                        {post.content}
                    </div>
                </article>
            </div>
        </div>
    )
}
