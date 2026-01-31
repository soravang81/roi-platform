'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewBlogPostPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [author, setAuthor] = useState('Admin')
    const [isPublished, setIsPublished] = useState(false)
    const [loading, setLoading] = useState(false)

    // Auto-slug
    const handleTitleChange = (e: any) => {
        setTitle(e.target.value)
        setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/admin/blog/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, content, author, isPublished })
            })
            if (res.ok) {
                alert('Post created successfully')
                router.push('/admin/blog')
            } else {
                const data = await res.json()
                alert(data.error)
            }
        } catch (e) {
            alert('Error')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '0.5rem',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        color: 'white',
        fontSize: '1rem'
    }

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        opacity: 0.8
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="heading-xl text-gradient">Create New Post</h2>
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Title</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter post title..."
                            value={title}
                            onChange={handleTitleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Slug (URL)</label>
                        <input
                            type="text"
                            required
                            placeholder="post-url-slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={{ ...inputStyle, fontFamily: 'monospace' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Content (HTML/Markdown)</label>
                    <textarea
                        required
                        rows={12}
                        placeholder="# Write something amazing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ ...inputStyle, fontFamily: 'monospace', lineHeight: '1.5' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Author</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                        <input
                            type="checkbox"
                            id="pub"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="pub" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Publish Immediately</label>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving Post...' : '🚀 Publish Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}
