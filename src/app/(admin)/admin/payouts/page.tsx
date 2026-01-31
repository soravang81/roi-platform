'use client'

import { useState, useEffect } from 'react'

export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPayouts = async () => {
        try {
            // Reusing pending deposits API logic but for withdrawals?
            // Need "api/admin/payouts/pending".
            const res = await fetch('/api/admin/payouts/pending')
            const data = await res.json()
            if (data.withdrawals) setPayouts(data.withdrawals)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchPayouts() }, [])

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        const txHash = action === 'APPROVE' ? prompt('Enter Transaction Hash (Optional):') : null

        try {
            const res = await fetch('/api/admin/payouts/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: id, action, txHash })
            })
            if (res.ok) {
                alert('Processed')
                fetchPayouts()
            } else alert('Failed')
        } catch (e) { alert('Error') }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 className="text-2xl font-bold mb-6">Pending Withdrawals</h2>
            {loading ? <p>Loading...</p> : (
                <div className="grid gap-4">
                    {payouts.length === 0 && <p>No pending withdrawals.</p>}
                    {payouts.map(p => (
                        <div key={p.id} className="glass-panel p-6 flex justify-between items-center bg-red-900/10 border-red-500/20">
                            <div>
                                <div className="font-bold text-xl">{p.amount} <span className="text-sm opacity-75">({p.description})</span></div>
                                <div className="text-sm opacity-70">User: {p.user.name}</div>
                                <div className="text-xs opacity-50">{new Date(p.createdAt).toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(p.id, 'APPROVE')} className="btn bg-green-600">Approve</button>
                                <button onClick={() => handleAction(p.id, 'REJECT')} className="btn bg-red-600">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
