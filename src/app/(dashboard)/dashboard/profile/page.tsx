'use client'

import { useState, useEffect } from 'react'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [kycDoc, setKycDoc] = useState('')
    const [newPass, setNewPass] = useState('')
    const [msg, setMsg] = useState('')

    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                setUser(data.user)
                if (data.user?.kycDocument) setKycDoc(data.user.kycDocument)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleUpdate = async () => {
        setMsg('')
        const body: any = {}
        if (newPass) body.password = newPass
        if (kycDoc !== user?.kycDocument) body.kycDocument = kycDoc

        if (Object.keys(body).length === 0) return

        const res = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        if (res.ok) {
            setMsg('Profile Updated Successfully!')
            setNewPass('')
            setUser({ ...user, ...data.user }) // Update local state especially kycStatus
        } else {
            setMsg('Error: ' + data.error)
        }
    }

    if (loading) return <div>Loading Profile...</div>

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>My Profile</h2>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Basic Info */}
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Personal Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', opacity: 0.7, marginBottom: '0.5rem' }}>Full Name</label>
                            <input disabled value={user?.name || ''} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '0.5rem', opacity: 0.5 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', opacity: 0.7, marginBottom: '0.5rem' }}>Email</label>
                            <input disabled value={user?.email || ''} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '0.5rem', opacity: 0.5 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', opacity: 0.7, marginBottom: '0.5rem' }}>Mobile</label>
                            <input disabled value={user?.mobile || ''} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '0.5rem', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                {/* KYC */}
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        KYC Verification
                        <span style={{
                            fontSize: '0.9rem',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '1rem',
                            background: user?.kycStatus === 'APPROVED' ? 'var(--success)' :
                                user?.kycStatus === 'REJECTED' ? 'var(--error)' : 'orange',
                            color: 'white'
                        }}>
                            {user?.kycStatus}
                        </span>
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', opacity: 0.7, marginBottom: '0.5rem' }}>ID Document Number / URL</label>
                        <input
                            value={kycDoc}
                            onChange={e => setKycDoc(e.target.value)}
                            placeholder="Enter ID Number or document URL"
                            disabled={user?.kycStatus === 'APPROVED'}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>
                            Enter your Aadhaar/Passport number or a link to the document.
                        </p>
                    </div>
                </div>

                {/* Password */}
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Security</h3>
                    <div>
                        <label style={{ display: 'block', opacity: 0.7, marginBottom: '0.5rem' }}>New Password</label>
                        <input
                            type="password"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="Leave empty to keep current"
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ textAlign: 'right' }}>
                    {msg && <span style={{ marginRight: '1rem', color: msg.includes('Error') ? 'var(--error)' : 'var(--success)' }}>{msg}</span>}
                    <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
