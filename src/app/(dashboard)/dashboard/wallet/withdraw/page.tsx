'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WithdrawalPage() {
    const router = useRouter() // Added for redirect if needed
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [type, setType] = useState('USDT')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, address, type })
            })
            const data = await res.json()
            if (res.ok) {
                alert('Withdrawal Requested Successfully')
                setAmount('')
                setAddress('')
                router.refresh()
            } else {
                alert(data.error)
            }
        } catch (e) { alert('Error') }
        finally { setLoading(false) }
    }

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        borderRadius: '0.5rem',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid var(--glass-border)',
        color: 'white',
        fontSize: '1rem',
        outline: 'none'
    }

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        opacity: 0.8
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="heading-xl text-gradient" style={{ marginBottom: '2rem' }}>Withdraw Funds</h2>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setType('USDT')}
                        className={`btn ${type === 'USDT' ? 'btn-primary' : ''}`}
                        style={{
                            flex: 1,
                            border: type === 'USDT' ? 'none' : '1px solid var(--glass-border)',
                            background: type === 'USDT' ? '' : 'transparent'
                        }}
                    >
                        USDT (TRC20)
                    </button>
                    <button
                        onClick={() => setType('INR')}
                        className={`btn ${type === 'INR' ? 'btn-primary' : ''}`}
                        style={{
                            flex: 1,
                            border: type === 'INR' ? 'none' : '1px solid var(--glass-border)',
                            background: type === 'INR' ? '' : 'transparent'
                        }}
                    >
                        Bank / UPI
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Amount ($)</label>
                        <input
                            type="number"
                            required
                            min="10"
                            placeholder="Min: $10"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>
                            {type === 'USDT' ? 'Wallet Address (TRC20)' : 'Bank Account Number / UPI ID'}
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={type === 'USDT' ? 'T...' : 'Enter account details'}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ paddingTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                            {loading ? 'Processing Request...' : 'Submit Withdrawal Request'}
                        </button>
                    </div>
                </form>
            </div>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.6 }}>
                Withdrawals are processed within 24 hours. <br />
                Please verify your details before submitting.
            </p>
        </div>
    )
}
