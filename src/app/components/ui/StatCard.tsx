interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    icon: string
    trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ label, value, subValue, icon, trend }: StatCardProps) {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <span style={{ color: 'var(--secondary-foreground)', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                {value}
            </div>
            {subValue && (
                <div style={{ fontSize: '0.85rem', color: trend === 'down' ? 'var(--error)' : 'var(--success)' }}>
                    {subValue}
                </div>
            )}
        </div>
    )
}
