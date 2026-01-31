'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
    { label: 'Overview', href: '/dashboard', icon: '🏠' },
    { label: 'Investments', href: '/dashboard/investments', icon: '📈' },
    { label: 'Deposit', href: '/dashboard/wallet/deposit', icon: '💰' },
    { label: 'Withdraw', href: '/dashboard/wallet/withdraw', icon: '💸' },
    { label: 'Transactions', href: '/dashboard/transactions', icon: '📝' },
    { label: 'News & Updates', href: '/dashboard/blog', icon: '📰' },
    { label: 'Notifications', href: '/dashboard/notifications', icon: '🔔' },
    { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    // { label: 'Support', href: '/dashboard/support', icon: '🎧' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="glass-panel" style={{
            width: '260px',
            height: 'calc(100vh - 2rem)',
            position: 'fixed',
            left: '1rem',
            top: '1rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            zIndex: 50,
            overflow: 'hidden'
        }}>
            <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                <div className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                    ROI Platform
                </div>
                {/* <div style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.8, marginTop: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Admin Console
                </div> */}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                padding: '0.85rem 1rem',
                                borderRadius: '0.75rem',
                                backgroundColor: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                                color: isActive ? 'var(--primary)' : 'var(--secondary-foreground)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontWeight: isActive ? 600 : 500,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', filter: isActive ? 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))' : 'none' }}>{item.icon}</span>
                            {item.label}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '10%',
                                    bottom: '10%',
                                    width: '3px',
                                    backgroundColor: 'var(--primary)',
                                    borderRadius: '0 4px 4px 0',
                                    boxShadow: '0 0 10px var(--primary)'
                                }} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                <button
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        justifyContent: 'flex-start',
                        gap: '0.75rem',
                        transition: 'all 0.2s',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
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
