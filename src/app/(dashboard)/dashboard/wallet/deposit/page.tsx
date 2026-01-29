'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DepositPage() {
    const router = useRouter()
    const [type, setType] = useState('INR')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, type, description }),
            })

            if (res.ok) {
                alert('Deposit request submitted! Waiting for Admin approval.')
                router.push('/dashboard/wallet')
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to submit')
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>Deposit Funds</h2>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        className={`btn ${type === 'INR' ? 'btn-primary' : ''}`}
                        onClick={() => setType('INR')}
                        style={{ flex: 1, border: type !== 'INR' ? '1px solid var(--glass-border)' : 'none' }}
                    >
                        INR Deposit
                    </button>
                    <button
                        className={`btn ${type === 'USDT' ? 'btn-primary' : ''}`}
                        onClick={() => setType('USDT')}
                        style={{ flex: 1, border: type !== 'USDT' ? '1px solid var(--glass-border)' : 'none' }}
                    >
                        USDT Deposit
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount ({type})</label>
                        <input
                            type="number"
                            required
                            min="10"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                color: 'white'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            {type === 'INR' ? 'UTR Number (Ref ID)' : 'Transaction Hash (TxID)'}
                        </label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '0.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                color: 'white'
                            }}
                        />
                    </div>

                    {type === 'INR' && (
                        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                            <p><strong>Bank Details:</strong></p>
                            <p>Acct: ROI Tech Solutions</p>
                            <p>IFSC: HDFC0001234</p>
                            <p>UPI: pay@roi.com</p>
                        </div>
                    )}

                    {type === 'USDT' && (
                        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                            <p><strong>TRC20 Address:</strong></p>
                            <p style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>TLsV52sRDL7t5D3y4CbdGu</p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    )
}
