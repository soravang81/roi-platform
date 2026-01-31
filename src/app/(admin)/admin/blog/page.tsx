'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminBlogListPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/blog/list')
            .then(res => res.json())
            .then(data => {
                if (data.posts) setPosts(data.posts)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 className="heading-xl text-gradient">Blog Management</h2>
                    <p style={{ color: 'var(--secondary-foreground)' }}>Manage your news and updates</p>
                </div>
                <Link href="/admin/blog/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    + New Post
                </Link>
            </div>

            {loading ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>Loading posts...</div>
            ) : posts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>📝</div>
                    <p style={{ fontSize: '1.2rem' }}>No blog posts found.</p>
                    <Link href="/admin/blog/new" style={{ color: 'var(--primary)' }}>Write your first post</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {posts.map(post => (
                        <div key={post.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: post.isPublished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: post.isPublished ? '#10b981' : '#f59e0b'
                                    }}>
                                        {post.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{post.title}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.6, fontFamily: 'monospace' }}>{post.slug}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>Edit</button>
                                <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
