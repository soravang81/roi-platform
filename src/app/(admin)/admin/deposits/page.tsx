'use client'

import { useState, useEffect } from 'react'

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<any[]>([])

    const fetchDeposits = () => {
        fetch('/api/admin/deposits')
            .then(res => res.json())
            .then(data => {
                if (data.deposits) setDeposits(data.deposits)
            })
    }

    useEffect(() => {
        fetchDeposits()
    }, [])

    const handleAction = async (transactionId: string, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this deposit?`)) return

        try {
            const res = await fetch('/api/admin/deposits', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId, status }),
            })
            if (res.ok) {
                fetchDeposits() // Refresh list
            } else {
                alert('Action failed')
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Deposit Requests</h2>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Ref ID</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deposits.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div>{tx.user?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>{tx.user?.email}</div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{tx.amount}</td>
                                <td style={{ padding: '1rem' }}>
                                    {tx.description.includes('USDT') ? 'USDT' : 'INR'}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{tx.txId}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.8rem',
                                        background: tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' :
                                            tx.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: tx.status === 'PENDING' ? 'var(--warning)' :
                                            tx.status === 'APPROVED' ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    {tx.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleAction(tx.id, 'APPROVED')}
                                                style={{ padding: '0.5rem', background: 'var(--success)', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: 'white' }}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => handleAction(tx.id, 'REJECTED')}
                                                style={{ padding: '0.5rem', background: 'var(--error)', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: 'white' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
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
