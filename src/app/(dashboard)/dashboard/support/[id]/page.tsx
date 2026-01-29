'use client'

import { useState, useEffect, use } from 'react'
import { useParams } from 'next/navigation'

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() or await in useEffect if strictly needed, 
    // but in Client Components, params prop is a Promise in Next 15.
    // However, simplest fix for client component is to unwrap it via `use(params)` hook pattern if available, or just async effect.
    // Actually, `useParams` hook is safer in Client Components.
    const { id } = useParams()

    const [ticket, setTicket] = useState<any>(null)
    const [msgs, setMsgs] = useState<any[]>([])
    const [reply, setReply] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchTicket = () => {
        if (!id) return
        fetch(`/api/support/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.ticket) {
                    setTicket(data.ticket)
                    setMsgs(data.ticket.messages || [])
                }
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchTicket()
        const interval = setInterval(fetchTicket, 5000) // Poll for updates
        return () => clearInterval(interval)
    }, [id])

    const sendReply = async () => {
        if (!reply) return
        await fetch(`/api/support/${id}`, {
            method: 'POST',
            body: JSON.stringify({ message: reply })
        })
        setReply('')
        fetchTicket()
    }

    if (loading) return <div>Loading...</div>
    if (!ticket) return <div>Ticket Not Found</div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h2>{ticket.subject} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>#{ticket.id.slice(0, 8)}</span></h2>
                <div style={{ opacity: 0.7 }}>Status: {ticket.status}</div>
            </div>

            <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                {msgs.map((m: any) => (
                    <div key={m.id} style={{
                        alignSelf: m.user.role === 'ADMIN' ? 'flex-start' : 'flex-end',
                        maxWidth: '70%',
                        background: m.user.role === 'ADMIN' ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                        padding: '1rem',
                        borderRadius: '0.8rem',
                        borderBottomLeftRadius: m.user.role === 'ADMIN' ? 0 : '0.8rem',
                        borderBottomRightRadius: m.user.role !== 'ADMIN' ? 0 : '0.8rem'
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>{m.user.name} ({m.user.role})</div>
                        <div>{m.message}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.5, textAlign: 'right', marginTop: '0.2rem' }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    disabled={ticket.status === 'CLOSED'}
                    onKeyDown={e => e.key === 'Enter' && sendReply()}
                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                />
                <button onClick={sendReply} disabled={ticket.status === 'CLOSED'} className="btn btn-primary">Send</button>
            </div>
        </div>
    )
}
