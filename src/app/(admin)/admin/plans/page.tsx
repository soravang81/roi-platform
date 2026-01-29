'use client'

import { useState, useEffect } from 'react'

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [formData, setFormData] = useState({
        name: '',
        minAmount: '',
        maxAmount: '',
        roiPercent: '',
        duration: '',
        roiFrequency: 'DAILY',
        description: '',
        currency: 'USDT'
    })

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        const res = await fetch('/api/admin/plans')
        const data = await res.json()
        if (data.plans) setPlans(data.plans)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert('Plan created!')
                fetchPlans()
                setFormData({
                    name: '', minAmount: '', maxAmount: '', roiPercent: '', duration: '', roiFrequency: 'DAILY', description: '', currency: 'USDT'
                })
            } else {
                alert('Failed to create plan')
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Manage Investment Plans</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* CREATE FORM */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Create New Plan</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            placeholder="Plan Name (e.g. Gold Plan)"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number" placeholder="Min Amount"
                                value={formData.minAmount}
                                onChange={e => setFormData({ ...formData, minAmount: e.target.value })}
                                required
                                style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                            />
                            <input
                                type="number" placeholder="Max Amount (Optional)"
                                value={formData.maxAmount}
                                onChange={e => setFormData({ ...formData, maxAmount: e.target.value })}
                                style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number" placeholder="ROI %"
                                step="0.1"
                                value={formData.roiPercent}
                                onChange={e => setFormData({ ...formData, roiPercent: e.target.value })}
                                required
                                style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                            />
                            <input
                                type="number" placeholder="Duration (Days)"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                required
                                style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                            />
                        </div>

                        <select
                            value={formData.roiFrequency}
                            onChange={e => setFormData({ ...formData, roiFrequency: e.target.value })}
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', width: '100%', boxSizing: 'border-box' }}
                        >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                        </select>

                        <select
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem', width: '100%', boxSizing: 'border-box' }}
                        >
                            <option value="USDT">USDT</option>
                            <option value="INR">INR</option>
                        </select>

                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />

                        <button type="submit" className="btn btn-primary">Create Plan</button>
                    </form>
                </div>

                {/* LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Active Plans</h3>
                    {plans.map(plan => (
                        <div key={plan.id} className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>{plan.name}</strong>
                                <span style={{ color: 'var(--accent)' }}>{plan.roiPercent}% ROI</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--secondary-foreground)' }}>
                                Min: {plan.minAmount} • Duration: {plan.duration} Days
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
