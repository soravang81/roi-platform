'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const refCode = searchParams.get('ref') || ''

    const [form, setForm] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        referrerCode: refCode
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()

            if (res.ok) {
                router.push('/login?registered=true')
            } else {
                setError(data.error || 'Registration failed')
            }
        } catch (err) {
            setError('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Full Name</label>
                <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Email Address</label>
                <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    placeholder="john@example.com"
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Mobile Number</label>
                <input
                    type="tel"
                    required
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    placeholder="+91..."
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Password</label>
                <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    placeholder="Create a strong password"
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Referral Code (Optional)</label>
                <input
                    type="text"
                    value={form.referrerCode}
                    onChange={e => setForm({ ...form, referrerCode: e.target.value })}
                    style={{ width: '100%', padding: '0.9rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    placeholder="Have a referral code?"
                />
            </div>

            {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', padding: '1rem' }}
            >
                {loading ? 'Creating Account...' : 'Register Now'}
            </button>
        </form>
    )
}

export default function RegisterPage() {
    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
            <Suspense fallback={<div>Loading form...</div>}>
                <RegisterForm />
            </Suspense>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.7 }}>
                Already have an account? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Login</Link>
            </div>
        </div>
    )
}
