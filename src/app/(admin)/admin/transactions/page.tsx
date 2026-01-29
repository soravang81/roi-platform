'use client'

import { useState, useEffect } from 'react'

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ page: 1, type: 'ALL', status: 'ALL', userId: '' })
    const [debouncedUserId, setDebouncedUserId] = useState('')

    // Debounce User ID search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, userId: debouncedUserId, page: 1 }))
        }, 800)
        return () => clearTimeout(timer)
    }, [debouncedUserId])

    const fetchTransactions = () => {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('page', filters.page.toString())
        params.append('limit', '10')
        // Admin View All Flag implied if no userId, but wait, my API logic:
        // if queryUserId is undefined, it fetches all.
        // if filters.userId is '' (empty), we don't send it.

        if (filters.userId) params.append('userId', filters.userId)
        else params.append('all', 'true') // Explicitly ask for global view

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
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const typeOptions = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'ROI', 'SALARY', 'REFERRAL', 'INVESTMENT_DEBIT', 'BREAKDOWN_CREDIT']
    const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'FAILED']

    const downloadCSV = () => {
        alert('CSV Download logic would go here (fetch all with format=csv)')
    }

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'FAILED') => {
        if (!confirm(`Are you sure you want to mark this transaction as ${status}?`)) return

        setLoading(true)
        try {
            const res = await fetch('/api/transactions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            const data = await res.json()
            if (data.success) {
                alert(`Transaction ${status} Successfully`)
                fetchTransactions() // Refresh list
            } else {
                alert(data.error || 'Msg Failed')
            }
        } catch (err) {
            console.error(err)
            alert('Error updating transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Global Transactions</h2>
                <button onClick={downloadCSV} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>Export CSV</button>
            </div>

            {/* FILTERS */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    placeholder="Search User ID..."
                    value={debouncedUserId}
                    onChange={e => setDebouncedUserId(e.target.value)}
                    style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', minWidth: '250px' }}
                />

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
                            <th style={{ padding: '1rem' }}>User</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Description</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : transactions.length > 0 ? (
                            transactions.map((tx: any) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{tx.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{tx.user?.email}</div>
                                    </td>
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
                                    <td style={{ padding: '1rem' }}>
                                        {tx.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleStatusUpdate(tx.id, 'APPROVED')}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '0.3rem',
                                                        border: 'none',
                                                        background: 'var(--success)',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(tx.id, 'FAILED')}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '0.3rem',
                                                        border: 'none',
                                                        background: 'var(--error)',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {tx.status !== 'PENDING' && <span style={{ opacity: 0.5 }}>-</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No transactions found</td></tr>
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
