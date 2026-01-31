'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'


export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
            {/* Sidebar */}
            <div style={{
                position: isMobile ? 'fixed' : 'fixed',
                left: 0, top: 0, bottom: 0,
                width: '270px',
                zIndex: 50,
                transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
                transition: 'transform 0.3s ease',
            }}>
                <Sidebar />
            </div>

            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}

            {/* Main Content */}
            <div style={{
                flex: 1,
                marginLeft: isMobile ? 0 : '270px',
                width: '100%',
                transition: 'margin-left 0.3s ease'
            }}>
                {isMobile && (
                    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--background)', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 30 }}>
                        <button onClick={() => setSidebarOpen(true)} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem' }}>
                            ☰
                        </button>
                        <div style={{ fontWeight: 'bold' }}>RoI Platform</div>
                    </div>
                )}

                {!isMobile && <Header />}

                <main className="container animate-slide-up" style={{ padding: '1.5rem 1rem' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
