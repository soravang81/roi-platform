'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
    { label: 'Overview', href: '/dashboard', icon: '🏠' },
    { label: 'Wallets', href: '/dashboard/wallet', icon: '💰' },
    { label: 'Investments', href: '/dashboard/investments', icon: '📈' },
    // { label: 'Team', href: '/dashboard/team', icon: '👥' },
    { label: 'Transactions', href: '/dashboard/transactions', icon: '📝' },
    // { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="glass-panel" style={{
            width: '250px',
            height: 'calc(100vh - 2rem)',
            position: 'fixed',
            left: '1rem',
            top: '1rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            zIndex: 50
        }}>
            <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">
                ROI Platform
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--secondary-foreground)',
                                border: isActive ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        justifyContent: 'flex-start',
                        gap: '0.75rem'
                    }}
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' })
                        window.location.href = '/login'
                    }}
                >
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    )
}
