const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        console.log("Verifying Admin Stats...");

        // 1. Create Admin
        const adminEmail = `admin_stats_${Date.now()}@test.com`
        const regAdmin = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin', name: 'Admin Stats', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        const { execSync } = require('child_process');
        if (regAdmin.user && regAdmin.user.id) {
            execSync(`npx prisma db execute --stdin <<EOF
UPDATE User SET role = 'ADMIN' WHERE id = '${regAdmin.user.id}';
EOF`)
        }

        const loginAdmin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin' })
        })
        const cookieAdmin = loginAdmin.headers.get('set-cookie').split(';')[0]

        // 2. Fetch Stats
        const res = await fetch(`${BASE_URL}/admin/stats`, { headers: { 'Cookie': cookieAdmin } })
        if (!res.ok) throw new Error(`Stats Check Failed: ${res.status}`)

        const data = await res.json()
        console.log("Stats Fetched:", data)

        if (typeof data.totalUsers !== 'number') throw new Error("Missing totalUsers")
        if (typeof data.recentTransactions === 'undefined') throw new Error("Missing recentTransactions")

        console.log("SUCCESS: Admin Stats API Verified")

    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
