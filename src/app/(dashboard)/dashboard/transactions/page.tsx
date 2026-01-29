'use client'

import { useState, useEffect } from 'react'

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ page: 1, type: 'ALL', status: 'ALL' })

    const fetchTransactions = () => {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('page', filters.page.toString())
        params.append('limit', '10')
        if (filters.type !== 'ALL') params.append('type', filters.type)
        if (filters.status !== 'ALL') params.append('status', filters.status)

        fetch(`/api/transactions?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data.transactions)
                setPagination(data.pagination)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchTransactions()
    }, [filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 })) // Reset to page 1 on filter change
    }

    const typeOptions = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'ROI', 'SALARY', 'REFERRAL', 'INVESTMENT_DEBIT', 'BREAKDOWN_CREDIT']
    const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'FAILED']

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Transaction History</h2>

            {/* FILTERS */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select
                    value={filters.type}
                    onChange={e => handleFilterChange('type', e.target.value)}
                    style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                >
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                    style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* TABLE */}
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : transactions.length > 0 ? (
                            transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            background: 'rgba(255,255,255,0.1)'
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {['DEPOSIT', 'ROI', 'SALARY', 'REFERRAL', 'BREAKDOWN_CREDIT'].includes(tx.type) ? '+' : '-'}
                                        ${tx.amount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: tx.status === 'APPROVED' ? 'var(--success)' :
                                                tx.status === 'FAILED' ? 'var(--error)' : 'orange'
                                        }}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', opacity: 0.8 }}>{tx.description}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No transactions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
                <button
                    disabled={filters.page >= (pagination.totalPages || 1)}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="btn btn-secondary"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
