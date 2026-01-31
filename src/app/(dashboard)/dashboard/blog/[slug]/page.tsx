'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BlogPostInternalPage() {
    const params = useParams()
    const [post, setPost] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'transparent' }}>Loading post...</div>
    if (!post) return <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'transparent' }}>Post not found or unavailable.</div>

    return (
        <div className="animate-fade-in">
            <Link href="/dashboard/blog" style={{ opacity: 0.7, textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>← Back to News</Link>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
