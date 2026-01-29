'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNew, setShowNew] = useState(false)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = () => {
        fetch('/api/support')
            .then(res => res.json())
            .then(data => {
                setTickets(data.tickets || [])
                setLoading(false)
            })
    }

    const createTicket = async () => {
        if (!subject || !message) return
        await fetch('/api/support', {
            method: 'POST',
            body: JSON.stringify({ subject, message })
        })
        setShowNew(false)
        setSubject('')
        setMessage('')
        fetchTickets()
    }

    if (loading) return <div>Loading Support...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2>Support Tickets</h2>
                <button onClick={() => setShowNew(!showNew)} className="btn btn-primary">
                    {showNew ? 'Cancel' : '+ New Ticket'}
                </button>
            </div>

            {showNew && (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3>Create Ticket</h3>
                    <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
                        <input
                            placeholder="Subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            style={{ padding: '0.8rem', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />
                        <textarea
                            placeholder="Describe your issue..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            style={{ padding: '0.8rem', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        />
                        <button onClick={createTicket} className="btn btn-primary" style={{ justifySelf: 'start' }}>Submit Ticket</button>
                    </div>
                </div>
            )}

            <div className="glass-panel">
                {tickets.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>No tickets found.</div>
                ) : (
                    tickets.map(t => (
                        <div key={t.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{t.subject}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Updated: {new Date(t.updatedAt).toLocaleDateString()}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{
                                    padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem',
                                    background: t.status === 'OPEN' ? 'var(--success)' : 'var(--secondary)'
                                }}>
                                    {t.status}
                                </span>
                                <Link href={`/dashboard/support/${t.id}`} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                    View
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
