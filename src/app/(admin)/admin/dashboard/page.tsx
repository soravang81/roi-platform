'use client'

import { useState, useEffect } from 'react'

import StatCard from '@/components/ui/StatCard'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>({
        totalUsers: 0,
        pendingKyc: 0,
        totalDeposits: 0,
        pendingWithdrawals: 0,
        recentTransactions: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data)
                setLoading(false)
            })
            .catch(err => setLoading(false))
    }, [])

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>System Overview</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    label="Total Users"
                    value={stats.totalUsers.toString()}
                    icon="👥"
                    trend="neutral"
                />
                <StatCard
                    label="Pending KYC"
                    value={stats.pendingKyc.toString()}
                    subValue={stats.pendingKyc > 0 ? "Action Required" : "All Clear"}
                    icon="📋"
                    trend={stats.pendingKyc > 0 ? "down" : "up"}
                />
                <StatCard
                    label="Total Deposits"
                    value={`₹${stats.totalDeposits.toLocaleString()}`}
                    icon="💰"
                />
                <StatCard
                    label="Pending Withdrawals"
                    value={stats.pendingWithdrawals.toString()}
                    icon="💸"
                />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3>Recent Activity</h3>
                {stats.recentTransactions.length === 0 ? (
                    <p style={{ color: 'var(--secondary-foreground)', marginTop: '1rem' }}>No recent activity.</p>
                ) : (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {stats.recentTransactions.map((tx: any) => (
                            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{tx.type}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{tx.user?.name} - {new Date(tx.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold' }}>${tx.amount}</div>
                                    <div style={{ fontSize: '0.75rem', color: tx.status === 'APPROVED' ? 'var(--success)' : 'orange' }}>{tx.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
