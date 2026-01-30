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
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="heading-xl text-gradient" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>System Overview</h2>
                <p style={{ color: 'var(--secondary-foreground)', fontSize: '1.1rem' }}>Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
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

            <div className="glass-panel animate-slide-up" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Recent Activity</h3>
                {stats.recentTransactions.length === 0 ? (
                    <p style={{ color: 'var(--secondary-foreground)', marginTop: '1rem', fontStyle: 'italic' }}>No recent activity to report.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentTransactions.map((tx: any) => (
                            <div key={tx.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '10px',
                                        background: tx.type === 'DEPOSIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        {tx.type === 'DEPOSIT' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{tx.type}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>{tx.user?.name} &bull; {new Date(tx.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: tx.type === 'DEPOSIT' ? 'var(--success)' : '#fff' }}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        display: 'inline-block',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '20px',
                                        background: tx.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: tx.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {tx.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
