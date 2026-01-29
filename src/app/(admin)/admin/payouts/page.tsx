'use client'

import { useState } from 'react'

export default function PayoutsPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const runPayout = async () => {
        if (!confirm('Run Daily Payout Process? This will credit ROI and Salaries.')) return

        setLoading(true)
        try {
            const res = await fetch('/api/admin/payouts', { method: 'POST' })
            const data = await res.json()
            setResult(data)
        } catch (e) {
            alert('Error running payouts')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Payout Management</h2>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '1rem' }}>Daily Cron Job</h3>
                <p style={{ marginBottom: '1.5rem', color: 'var(--secondary-foreground)' }}>
                    Process daily ROI distribution and Salary credits for all eligible users.
                    Usually runs automatically at 00:00.
                </p>

                <button
                    onClick={runPayout}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem' }}
                >
                    {loading ? 'Processing...' : '⚡ Run Daily Payout'}
                </button>

                {result && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid var(--success)' }}>
                        <strong>Success!</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>ROI Credited: {result.stats?.roi}</li>
                            <li>Salaries Paid: {result.stats?.salary}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
