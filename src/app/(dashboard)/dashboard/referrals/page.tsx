'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/components/ui/StatCard'

// Simple CSS Tree Component
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
                    <div style={{ fontWeight: 'bold' }}>{node.name || node.email}</div>
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

export default function ReferralsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/referrals/tree')
            .then(res => res.json())
            .then(data => setData(data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const copyLink = () => {
        if (!data?.stats?.referralCode) return
        // Use window.location.origin
        const link = `${window.location.origin}/register?ref=${data.stats.referralCode}`
        navigator.clipboard.writeText(link)
        alert('Referral Link Copied!')
    }

    if (loading) return <div>Loading Team...</div>

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>My Team</h2>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard label="Direct Referrals" value={data?.stats?.directs || 0} icon="👥" />
                <StatCard label="Direct Volume" value={`$${data?.stats?.directVolume || 0}`} icon="📊" />
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--secondary-foreground)', marginBottom: '0.5rem' }}>Your Referral Code</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{data?.stats?.referralCode || '---'}</div>
                    <button onClick={copyLink} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>Copy Link</button>
                </div>
            </div>

            {/* TREE */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Team Structure (Level 1-3)</h3>
                {data?.tree && data.tree.length > 0 ? (
                    data.tree.map((node: any) => (
                        <TreeNode key={node.id} node={node} />
                    ))
                ) : (
                    <div style={{ color: 'var(--secondary-foreground)', textAlign: 'center' }}>
                        No referrals yet. Share your link to grow your team!
                    </div>
                )}
            </div>
        </div>
    )
}
