'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const isHome = pathname === '/'

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // If not home, always show glass panel style or if scrolled
    const showGlass = !isHome || scrolled

    return (
        <nav className={`fixed top-6 left-4 right-4 md:left-8 md:right-8 z-50 transition-all duration-300 rounded-2xl ${showGlass ? 'glass-panel py-3' : 'py-5 bg-transparent'}`}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link href="/" className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none' }}>ROI Platform</Link>
                    <div className="hidden md:flex" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--secondary-foreground)' }}>
                        {isHome ? (
                            <>
                                <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                                <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                            </>
                        ) : (
                            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        )}
                        <Link href="/blog" className={`hover:text-white transition-colors ${pathname.startsWith('/blog') ? 'text-white font-bold' : ''}`}>Blog</Link>
                        <Link href="/#about" className="hover:text-white transition-colors">About</Link>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '0.5rem' }}>
                    <Link href="/login" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem' }}>Log In</Link>
                    <Link href="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Get Started</Link>
                </div>
            </div>
        </nav>
    )
}
