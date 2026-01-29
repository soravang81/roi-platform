'use client'

import { useState, useEffect } from 'react'

export default function AdminSettingsPage() {
    const [config, setConfig] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setConfig(data.config || {})
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        setMsg('')
        const res = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
        if (res.ok) setMsg('Settings Saved!')
        else setMsg('Error saving settings')
    }

    if (loading) return <div>Loading Settings...</div>

    return (
        <div>
            <h2>Global Settings</h2>

            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginTop: '2rem', maxWidth: '600px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Site Name</label>
                    <input
                        value={config.siteName || ''}
                        onChange={e => setConfig({ ...config, siteName: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Logo URL</label>
                    <input
                        value={config.logoUrl || ''}
                        onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Support Email</label>
                    <input
                        value={config.supportEmail || ''}
                        onChange={e => setConfig({ ...config, supportEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--success)' }}>{msg}</span>
                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                </div>
            </div>
        </div>
    )
}
