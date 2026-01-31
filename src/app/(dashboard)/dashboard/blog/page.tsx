'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BlogInternalPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                if (data.posts) setPosts(data.posts)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="animate-fade-in">
            <h1 className="heading-xl text-gradient" style={{ marginBottom: '2rem' }}>News & Updates</h1>

            {loading ? (
                <p style={{ textAlign: 'center', opacity: 0.6 }}>Loading updates...</p>
            ) : posts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    No posts published yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {posts.map(post => (
                        <Link href={`/dashboard/blog/${post.slug}`} key={post.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                {new Date(post.createdAt).toLocaleDateString()} &bull; {post.author}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{post.title}</h2>
                            <p style={{ opacity: 0.8, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {post.content}
                            </p>
                            <span style={{ color: 'var(--primary)', marginTop: 'auto', fontWeight: 'bold' }}>Read More →</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
