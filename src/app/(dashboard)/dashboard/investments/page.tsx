'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/components/ui/StatCard'

export default function InvestmentsPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [activeInvestments, setActiveInvestments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [plansRes, investmentsRes] = await Promise.all([
                    fetch('/api/plans'),
                    fetch('/api/investments/active')
                ])
                const plansData = await plansRes.json()
                const investmentsData = await investmentsRes.json()

                if (plansData.plans) setPlans(plansData.plans)
                if (investmentsData.investments) setActiveInvestments(investmentsData.investments)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        loadData()
    }, [])

    const handlePurchase = async (plan: any) => {
        // For simplicity, defaulting to minAmount needed or prompt user.
        // Proposing to prompt:
        const currencySymbol = plan.currency === 'INR' ? '₹' : '$'
        const currencyName = plan.currency || 'USDT'

        const amount = prompt(`Enter Amount to Invest (Min: ${currencySymbol}${plan.minAmount})`, plan.minAmount.toString())
        if (!amount) return

        // Confirm Breakdown
        const confirmMsg = `Invest ${currencySymbol}${amount} (${currencyName})?\n\nNote: 20% will be deducted as system fee.\n80% (${currencySymbol}${parseFloat(amount) * 0.8}) will be credited to Breakdown Wallet.`
        if (!confirm(confirmMsg)) return

        try {
            const res = await fetch('/api/investments/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    amount: parseFloat(amount)
                })
            })
            const data = await res.json()
            if (res.ok) {
                alert('Investment Successful!')
                window.location.reload()
            } else {
                alert(data.error)
            }
        } catch (e) {
            alert('Error processing investment')
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Investments</h2>

            {/* ACTIVE INVESTMENTS */}
            <h3 style={{ marginBottom: '1rem' }}>Active Portfolio</h3>
            {activeInvestments.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem', color: 'var(--secondary-foreground)' }}>
                    No active investments found.
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {activeInvestments.map(inv => (
                        <StatCard
                            key={inv.id}
                            label={inv.plan.name}
                            value={`${inv.amount} USDT`}
                            subValue={`Ends: ${new Date(inv.endDate).toLocaleDateString()}`}
                            icon="📈"
                            trend="up"
                        />
                    ))}
                </div>
            )}

            {/* AVAILABLE PLANS */}
            <h3 style={{ marginBottom: '1rem' }}>Available Plans</h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {plans.map(plan => (
                    <div key={plan.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {plan.name}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
                            {plan.roiPercent}% <span style={{ fontSize: '1rem', color: 'var(--secondary-foreground)', fontWeight: 'normal' }}>ROI</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--secondary-foreground)' }}>
                            <div>⏱ Duration: <strong>{plan.duration} Days</strong></div>
                            <div>
                                💵 Min Invest: <strong>{plan.currency === 'INR' ? '₹' : '$'}{plan.minAmount} {plan.currency || 'USDT'}</strong>
                            </div>
                            <div>🔄 Payout: <strong>{plan.roiFrequency}</strong></div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 'auto' }}
                            onClick={() => handlePurchase(plan)}
                        >
                            Invest Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
