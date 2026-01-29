'use client'

import { useState, useEffect } from 'react'

export default function CurrencyConverter() {
    const [amount, setAmount] = useState<number>(1)
    const [from, setFrom] = useState('USD')
    const [to, setTo] = useState('INR')
    const [rate, setRate] = useState<number>(87.50) // Mock rate
    const [result, setResult] = useState<number>(87.50)

    // Mock Rates
    const rates: any = {
        'USD': { 'INR': 87.50, 'EUR': 0.92, 'GBP': 0.79 },
        'INR': { 'USD': 0.011, 'EUR': 0.010, 'GBP': 0.009 },
        'EUR': { 'USD': 1.09, 'INR': 95.20, 'GBP': 0.86 },
        'GBP': { 'USD': 1.27, 'INR': 110.50, 'EUR': 1.16 }
    }

    useEffect(() => {
        const r = rates[from]?.[to] || 1
        setRate(r)
        setResult(amount * r)
    }, [amount, from, to])

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>💱 Currency Converter</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem', display: 'block' }}>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem', display: 'block' }}>From</label>
                        <select
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        >
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>➡️</div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem', display: 'block' }}>To</label>
                        <select
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '0.5rem' }}
                        >
                            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>1 {from} = {rate} {to}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {result.toFixed(2)} {to}
                    </div>
                </div>
            </div>
        </div>
    )
}
