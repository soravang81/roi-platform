'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'

export default function Home() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <main className="min-h-screen" style={{ overflowX: 'hidden', position: 'relative' }}>
            {/* Background Grid Layer */}
            <div className="bg-grid" style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                padding: '10rem 1rem 6rem',
                textAlign: 'center'
            }}>
                {/* Clean background without blurry blobs */}

                <div className="container animate-fade-in relative z-10">
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        marginBottom: '2rem',
                        fontSize: '0.875rem',
                        color: 'var(--primary)',
                        fontWeight: 600
                    }}>
                        <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                            <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: 'var(--primary)', opacity: 0.75 }}></span>
                            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: 'var(--primary)' }}></span>
                        </span>
                        New Generation Investment
                    </div>

                    <h1 className="text-gradient" style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        maxWidth: '900px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Build Wealth with <br />Institutional Intelligence
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--secondary-foreground)',
                        maxWidth: '640px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.6
                    }}>
                        Experience the power of algorithmic trading. Secure, transparent, and designed to outperform the market consistently.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem' }}>
                        <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }}>
                            Start Investing Free
                        </Link>
                        {/* <Link href="/demo" className="btn" style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '1.1rem',
                            padding: '1rem 2rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            View Live Demo
                        </Link> */}
                    </div>

                    {/* Replaced complex mockup with a clean glass card stats preview */}
                    <div className="glass-panel" style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: '2rem',
                        borderRadius: '1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current APY</div>
                            <div className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>12.8%</div>
                        </div>
                        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Active Volume</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>$42.5M</div>
                        </div>
                        <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Users</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>15k+</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section style={{ padding: '3rem 1rem', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', background: 'rgba(2, 6, 23, 0.4)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Trusted by innovative teams worldwide</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', opacity: 0.5 }}>
                        {['HEXAGON', 'VERTEX', 'OMEGA', 'INFINITE', 'QUANTA'].map(logo => (
                            <div key={logo} style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.05em' }}>{logo}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" style={{ padding: '8rem 1rem' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 className="heading-xl text-gradient" style={{ marginBottom: '1rem' }}>Engineered for Performance</h2>
                        <p style={{ color: 'var(--secondary-foreground)', fontSize: '1.25rem' }}>Features that give you the edge in a volatile market.</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div className="glass-panel" style={{ padding: '3rem', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Algorithm-Driven Yields</h3>
                            <p style={{ fontSize: '1.1rem', color: 'var(--secondary-foreground)', maxWidth: '600px', lineHeight: 1.6 }}>
                                Our proprietary trading algorithms analyze millions of data points per second to identify arbitrage opportunities and optimize portfolio allocation in real-time.
                            </p>
                        </div>
                        <div className="glass-panel" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(15, 23, 42, 0.4))' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🛡️</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Bank-Grade Security</h3>
                            <p style={{ color: 'var(--secondary-foreground)' }}>256-bit encryption and multi-sig cold storage.</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '3rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>⚡</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Instant Liquidity</h3>
                            <p style={{ color: 'var(--secondary-foreground)' }}>Withdraw your funds to any wallet, instantly.</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '3rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>📊</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>Real-Time Analytics</h3>
                            <p style={{ color: 'var(--secondary-foreground)' }}>Track every cent of profit as it happens.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '6rem 1rem', background: 'linear-gradient(to bottom, transparent, rgba(14, 165, 233, 0.05))' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { quote: "ROI Platform has completely transformed how I manage my crypto portfolio. The returns are consistent and the interface is beautiful.", author: "Alex Chen", role: "Pro Trader" },
                            { quote: "Security was my #1 concern. Seeing their protocols and transparency gave me the confidence to invest significantly.", author: "Sarah Jenkins", role: "Angel Investor" },
                            { quote: "Finally, a platform that doesn't look like a spreadsheet. It's powerful, intuitive, and actually fun to use.", author: "Marcus Thorne", role: "Tech Entrepreneur" }
                        ].map((t, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>★★★★★</div>
                                <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6, color: '#e2e8f0' }}>"{t.quote}"</p>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#fff' }}>{t.author}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section style={{ padding: '8rem 1rem', textAlign: 'center' }}>
                <div className="container">
                    <div className="glass-panel" style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto', background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 1) 100%)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' }}>Ready to Elevate Your Portfolio?</h2>
                        <p style={{ color: 'var(--secondary-foreground)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Join thousands of smart investors who are building their future with ROI Platform today.
                        </p>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 1rem 2rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(2, 6, 23, 0.8)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', marginBottom: '3rem' }}>
                        <div style={{ maxWidth: '300px' }}>
                            <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>ROI Platform</div>
                            <p style={{ color: 'var(--secondary-foreground)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Empowering global investors with institutional-grade tools and strategies.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                            {/* Footer Links (Same as before but cleaner) */}
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Product</h4>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--secondary-foreground)', fontSize: '0.9rem' }}>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Enterprise</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Company</h4>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--secondary-foreground)', fontSize: '0.9rem' }}>
                                    <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Legal</h4>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--secondary-foreground)', fontSize: '0.9rem' }}>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                        © 2026 ROI Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </main>
    )
}
