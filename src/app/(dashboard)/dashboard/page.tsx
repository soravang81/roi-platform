'use client'

import StatCard from '@/components/ui/StatCard'
import CurrencyConverter from '@/components/CurrencyConverter'

export default function DashboardPage() {
    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    label="Total Balance"
                    value="₹0.00"
                    subValue="+0% this month"
                    icon="💰"
                    trend="neutral"
                />
                <StatCard
                    label="USDT Balance"
                    value="0.00 USDT"
                    icon="💵"
                />
                <StatCard
                    label="Active Investments"
                    value="₹0.00"
                    icon="📈"
                />
                <StatCard
                    label="Total ROI Earned"
                    value="₹0.00"
                    icon="🏦"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Transactions</h3>
                    <p style={{ color: 'var(--secondary-foreground)' }}>No transactions found.</p>
                </div>

                <div className="glass-panel" style={{ padding: '0', minHeight: '300px', overflow: 'hidden' }}>
                    <CurrencyConverter />
                </div>
            </div>
        </div>
    )
}
