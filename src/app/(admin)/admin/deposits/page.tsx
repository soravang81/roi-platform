'use client'

import { useState, useEffect } from 'react'

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch Deposits
    const fetchDeposits = async () => {
        try {
            // Need an API to list deposits. "api/admin/deposits/list"? 
            // Or reuse "api/transactions?type=DEPOSIT&status=PENDING" logic?
            // Let's assume we need to Create this list API too or fetch manually?
            // Actually, usually Admin needs a List API.
            // I'll create listing logic inline for now or assume a generic one.
            // Let's create a quick "api/admin/deposits/pending/route.ts" first? 
            // Or just mock for now? No, user asked for implementation.
            // I will create the UI to CALL a new "api/admin/deposits/pending" route.
            const res = await fetch('/api/admin/deposits/pending')
            const data = await res.json()
            if (data.deposits) setDeposits(data.deposits)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeposits()
    }, [])

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this deposit?`)) return
        try {
            const res = await fetch('/api/admin/deposits/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: id, action })
            })
            if (res.ok) {
                alert('Success')
                fetchDeposits() // Reload
            } else {
                alert('Failed')
            }
        } catch (e) {
            alert('Error')
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 className="text-2xl font-bold mb-6">Deposit Requests</h2>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {deposits.length === 0 && <p>No pending deposits.</p>}
                    {deposits.map(d => (
                        <div key={d.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{d.amount} <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>({d.description})</span></div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>User: {d.user.name} ({d.user.email})</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(d.createdAt).toLocaleString()}</div>
                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>TxID: {d.txId}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => handleAction(d.id, 'APPROVE')} className="btn" style={{ background: '#10b981' }}>Approve</button>
                                <button onClick={() => handleAction(d.id, 'REJECT')} className="btn" style={{ background: '#ef4444' }}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
