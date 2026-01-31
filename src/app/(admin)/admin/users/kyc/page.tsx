'use client'

import { useState, useEffect } from 'react'

export default function AdminKYCPage() {
    const [docs, setDocs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch Pending Docs
    const fetchDocs = async () => {
        try {
            // Need API to list pending KYCs. "api/admin/kyc/pending"?
            // I'll create this API next.
            const res = await fetch('/api/admin/kyc/pending')
            const data = await res.json()
            if (data.docs) setDocs(data.docs)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchDocs() }, [])

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Confirm ${action}?`)) return
        try {
            const res = await fetch('/api/admin/kyc/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId: id, action })
            })
            if (res.ok) {
                alert('Success')
                fetchDocs()
            } else alert('Failed')
        } catch (e) { alert('Error') }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 className="text-2xl font-bold mb-6">Pending KYC Verification</h2>
            {loading ? <p>Loading...</p> : (
                <div className="grid gap-4">
                    {docs.length === 0 && <p>No pending documents.</p>}
                    {docs.map(doc => (
                        <div key={doc.id} className="glass-panel p-6 flex justify-between items-center">
                            <div>
                                <div className="font-bold">{doc.type}</div>
                                <div className="text-sm opacity-75">User: {doc.user.name} ({doc.user.email})</div>
                                <div className="mt-2">
                                    <a href={doc.url} target="_blank" className="text-blue-400 underline">View Document</a>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(doc.id, 'APPROVE')} className="btn bg-green-500">Approve</button>
                                <button onClick={() => handleAction(doc.id, 'REJECT')} className="btn bg-red-500">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
