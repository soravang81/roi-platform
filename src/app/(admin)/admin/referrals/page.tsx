'use client'

import { useState } from 'react'

// Reusing TreeNode component concept (Inline for simplicity or could be shared)
const TreeNode = ({ node }: { node: any }) => {
    const [expanded, setExpanded] = useState(false)
    const hasChildren = node.children && node.children.length > 0

    return (
        <div style={{ marginLeft: '2rem', borderLeft: '1px dashed var(--glass-border)', paddingLeft: '1rem' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                    cursor: hasChildren ? 'pointer' : 'default'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <span style={{ fontSize: '1.2rem' }}>{node.kycStatus === 'APPROVED' ? '🟢' : '⚪️'}</span>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{node.name || node.email} <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>(ID: {node.id.substring(0, 6)})</span></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>
                        Vol: ${node.directBusiness} • Self: ${node.selfInvestment}
                    </div>
                </div>
                {hasChildren && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.7 }}>
                        {expanded ? '▼' : '▶'}
                    </span>
                )}
            </div>

            {expanded && hasChildren && (
                <div>
                    {node.children.map((child: any) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AdminReferralsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [targetId, setTargetId] = useState('')

    const fetchTree = async () => {
        if (!targetId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/referrals/tree?targetId=${targetId}`)
            const data = await res.json()
            setData(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Referral Network Explorer</h2>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input
                    placeholder="Enter User ID to View Tree"
                    value={targetId}
                    onChange={e => setTargetId(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                />
                <button onClick={fetchTree} disabled={loading} className="btn btn-primary">
                    {loading ? 'Fetching...' : 'View Tree'}
                </button>
            </div>

            {data && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <div><strong>Root User ID:</strong> {targetId}</div>
                        <div><strong>Directs:</strong> {data.stats?.directs}</div>
                        <div><strong>Direct Vol:</strong> ${data.stats?.directVolume}</div>
                    </div>

                    {data.tree && data.tree.length > 0 ? (
                        data.tree.map((node: any) => (
                            <TreeNode key={node.id} node={node} />
                        ))
                    ) : (
                        <div style={{ color: 'var(--secondary-foreground)' }}>No referrals found for this user.</div>
                    )}
                </div>
            )}
        </div>
    )
}
