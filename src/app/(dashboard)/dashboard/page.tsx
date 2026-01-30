import StatCard from '@/components/ui/StatCard'
import CurrencyConverter from '@/components/CurrencyConverter'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getData() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return null

    const payload: any = verifyToken(token.value)
    if (!payload) return null
    const userId = payload.userId

    // Fetch Wallets
    const wallets = await prisma.wallet.findMany({
        where: { userId }
    })

    const inrWallet = wallets.find(w => w.type === 'INR')?.balance || 0
    const usdtWallet = wallets.find(w => w.type === 'USDT')?.balance || 0
    // ROI Wallet might be separate or part of INR. Assuming 'ROI' type or checking how it's stored.
    // Based on schema, type is string. Let's assume 'ROI' type exists or it's added to INR.
    // Actually, schema says type: INR, USDT, ROI, SALARY.
    const roiWallet = wallets.find(w => w.type === 'ROI')?.balance || 0
    const totalRoi = wallets.find(w => w.type === 'ROI')?.balance || 0 // Or sum of ROI transactions?
    // "Total ROI Earned" usually implies historical earnings, not just current balance.
    // Let's query transactions for total earnings.
    const roiTransactions = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'ROI',
            status: 'APPROVED'
        },
        _sum: { amount: true }
    })
    const totalRoiEarned = roiTransactions._sum.amount || 0

    // active investments
    const activeInvestments = await prisma.investment.aggregate({
        where: {
            userId,
            status: 'ACTIVE'
        },
        _sum: { amount: true }
    })

    // Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    return {
        balance: inrWallet,
        usdtBalance: usdtWallet,
        activeInvestments: activeInvestments._sum.amount || 0,
        totalRoiEarned,
        recentTransactions
    }
}

export default async function DashboardPage() {
    const data = await getData()

    if (!data) {
        redirect('/login')
    }

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    label="Total Balance (INR)"
                    value={`₹${data.balance.toFixed(2)}`}
                    subValue="+0% this month"
                    icon="💰"
                    trend="neutral"
                />
                <StatCard
                    label="USDT Balance"
                    value={`${data.usdtBalance.toFixed(2)} USDT`}
                    icon="💵"
                />
                <StatCard
                    label="Active Investments"
                    value={`₹${data.activeInvestments.toFixed(2)}`}
                    icon="📈"
                />
                <StatCard
                    label="Total ROI Earned"
                    value={`₹${data.totalRoiEarned.toFixed(2)}`}
                    icon="🏦"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="text-xl font-bold">Recent Transactions</h3>
                        <a href="/dashboard/transactions" className="text-sm text-primary hover:underline">View All</a>
                    </div>

                    {data.recentTransactions.length === 0 ? (
                        <p style={{ color: 'var(--secondary-foreground)' }}>No transactions found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.recentTransactions.map((tx: any) => (
                                <div key={tx.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{tx.type}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 700,
                                        color: tx.type === 'DEPOSIT' || tx.type === 'ROI' ? 'var(--success)' : '#fff'
                                    }}>
                                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}
                                        {tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel" style={{ padding: '0', minHeight: '300px', overflow: 'hidden' }}>
                    <CurrencyConverter />
                </div>
            </div>
        </div>
    )
}
