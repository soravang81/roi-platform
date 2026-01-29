'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
    const [user, setUser] = useState<{ name: string, email: string } | null>(null)

    useEffect(() => {
        // This is a simple client-side fetch. In a real app we might use a context or SWR.
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user)
            })
            .catch(err => console.error(err))
    }, [])

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 2rem',
            height: '80px',
            marginBottom: '1rem'
        }}>
            <div style={{ marginLeft: '260px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Dashboard</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    lineHeight: '1.2'
                }}>
                    <span style={{ fontWeight: 600 }}>{user?.name || 'User'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>{user?.email}</span>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white'
                }}>
                    {user?.name?.[0] || 'U'}
                </div>
            </div>
        </header>
    )
}
