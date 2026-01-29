'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/support')
            .then(res => res.json())
            .then(data => {
                setTickets(data.tickets || [])
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading Admin Support...</div>

    return (
        <div>
            <h2>Support Management</h2>
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem' }}>Subject</th>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Updated</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem' }}>{t.subject}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{t.user.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{t.user.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem',
                                        background: t.status === 'OPEN' ? 'var(--success)' : 'var(--secondary)'
                                    }}>
                                        {t.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{new Date(t.updatedAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <Link href={`/dashboard/support/${t.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                        Manage
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
