'use client'

import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchUsers = () => {
        setLoading(true)
        fetch(`/api/admin/users?search=${search}`)
            .then(res => res.json())
            .then(data => setUsers(data.users || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500)
        return () => clearTimeout(timer)
    }, [search])

    const handleAction = async (id: string, action: string) => {
        if (!confirm(`Are you sure you want to ${action}?`)) return

        await fetch(`/api/admin/users/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        })
        fetchUsers() // Refresh
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2>User Management</h2>
                <input
                    placeholder="Search Users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '0.6rem', width: '300px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                />
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>KYC</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : users.map((u: any) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.email}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{u.mobile}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ marginBottom: '0.3rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem',
                                            background: u.kycStatus === 'APPROVED' ? 'var(--success)' : u.kycStatus === 'PENDING' ? 'orange' : 'var(--secondary)'
                                        }}>
                                            {u.kycStatus}
                                        </span>
                                    </div>
                                    {u.kycDocument && u.kycStatus === 'PENDING' && (
                                        <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                            Doc: {u.kycDocument}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {u.isBlocked ? <span style={{ color: 'var(--error)' }}>⛔ BLOCKED</span> : <span style={{ color: 'var(--success)' }}>Active</span>}
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {u.kycStatus === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleAction(u.id, 'APPROVE_KYC')} className="btn" style={{ fontSize: '0.7rem', background: 'var(--success)', padding: '0.3rem 0.6rem' }}>✓ Verify</button>
                                            <button onClick={() => handleAction(u.id, 'REJECT_KYC')} className="btn" style={{ fontSize: '0.7rem', background: 'var(--error)', padding: '0.3rem 0.6rem' }}>✗ Reject</button>
                                        </>
                                    )}
                                    {u.isBlocked ? (
                                        <button onClick={() => handleAction(u.id, 'UNBLOCK')} className="btn" style={{ fontSize: '0.7rem', border: '1px solid white', padding: '0.3rem 0.6rem' }}>Unblock</button>
                                    ) : (
                                        <button onClick={() => handleAction(u.id, 'BLOCK')} className="btn" style={{ fontSize: '0.7rem', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.3rem 0.6rem' }}>Block</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
