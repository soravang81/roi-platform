'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/components/ui/StatCard'
import Link from 'next/link'

export default function WalletPage() {
    const [balances, setBalances] = useState<any>({ INR: 0, USDT: 0 })
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes, txRes] = await Promise.all([
                    fetch('/api/wallet/balance'),
                    fetch('/api/transactions?limit=10')
                ])
                const balanceData = await balanceRes.json()
                const txData = await txRes.json()

                if (balanceData.balances) setBalances(balanceData.balances)
                if (txData.transactions) setTransactions(txData.transactions)
            } catch (error) {
                console.error('Error fetching wallet data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>My Wallets</h2>
                <Link href="/dashboard/wallet/deposit" className="btn btn-primary">
                    + Add Funds
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    label="INR Wallet"
                    value={`₹${balances.INR.toLocaleString()}`}
                    subValue="Available Balance"
                    icon="🇮🇳"
                />
                <StatCard
                    label="USDT Wallet"
                    value={`${balances.USDT.toLocaleString()} USDT`}
                    subValue="Available Balance"
                    icon="💵"
                />
                <StatCard
                    label="ROI Wallet"
                    value={`${(balances.ROI || 0).toLocaleString()} USDT`}
                    subValue="Earnings"
                    icon="📈"
                />
            </div>

            {/* Transaction History */}
            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '1rem' }}>Recent Transactions</h3>
                {loading ? (
                    <p style={{ color: 'var(--secondary-foreground)' }}>Loading transactions...</p>
                ) : transactions.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.8rem' }}>Type</th>
                                <th style={{ padding: '0.8rem' }}>Amount</th>
                                <th style={{ padding: '0.8rem' }}>Status</th>
                                <th style={{ padding: '0.8rem' }}>Date</th>
                                <th style={{ padding: '0.8rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '0.5rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            fontSize: '0.8rem'
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>
                                        {['DEPOSIT', 'ROI', 'SALARY', 'REFERRAL', 'BREAKDOWN_CREDIT'].includes(tx.type) ? '+' : '-'}
                                        {tx.amount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span style={{
                                            color: tx.status === 'APPROVED' ? 'var(--success)' :
                                                tx.status === 'FAILED' ? 'var(--error)' : 'orange'
                                        }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem', opacity: 0.7 }}>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.8rem', opacity: 0.7 }}>
                                        {tx.description}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: 'var(--secondary-foreground)' }}>No transactions found.</p>
                )}
            </div>
        </div>
    )
}
