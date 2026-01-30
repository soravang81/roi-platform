interface StatCardProps {
    label: string
    value: string | number
    subValue?: string
    icon: string
    trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ label, value, subValue, icon, trend }: StatCardProps) {
    return (
        <div className="glass-panel animate-fade-in" style={{
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative glow */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '100px',
                height: '100px',
                background: 'var(--primary)',
                opacity: 0.1,
                filter: 'blur(40px)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', zIndex: 1 }}>
                <span style={{ color: 'var(--secondary-foreground)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.01em' }}>{label}</span>
                <span style={{
                    fontSize: '1.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                }}>{icon}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', zIndex: 1, color: '#fff' }}>
                {value}
            </div>
            {subValue && (
                <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: trend === 'down' ? '#ef4444' : trend === 'up' ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    <span style={{ fontSize: '1.2em' }}>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '•'}</span>
                    {subValue}
                </div>
            )}
        </div>
    )
}
