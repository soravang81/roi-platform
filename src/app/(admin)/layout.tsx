import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            <AdminSidebar />
            <div style={{ flex: 1, paddingLeft: '270px', paddingRight: '1rem' }}>
                <Header /> {/* Reusing Header for now, maybe custom admin header later */}
                <main className="container">
                    {children}
                </main>
            </div>
        </div>
    )
}
