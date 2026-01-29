export default function Home() {
    return (
        <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                ROI Investment Platform
            </h1>
            <p style={{ color: 'var(--secondary-foreground)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                A next-generation platform for managing your investments, referrals, and growth.
                Secure, transparent, and built for your financial success.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a href="/login" className="btn btn-primary">Get Started</a>
            </div>
        </main>
    )
}
