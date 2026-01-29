const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // 1. Register/Login a User
        const email = `trans_${Date.now()}@test.com`
        const reg = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass', name: 'Trans User', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        const login = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass' })
        })
        const cookie = login.headers.get('set-cookie').split(';')[0]

        console.log(`User created: ${email}`);

        // 2. Generate some transactions
        // Deposit
        await fetch(`${BASE_URL}/wallet/deposit`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ type: 'USDT', amount: 100, description: 'Test Deposit 1' })
        })
        await fetch(`${BASE_URL}/wallet/deposit`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ type: 'USDT', amount: 200, description: 'Test Deposit 2' })
        })

        // 3. Fetch All
        console.log('Fetching All Transactions...');
        let res = await fetch(`${BASE_URL}/transactions?limit=5`, { headers: { 'Cookie': cookie } })
        let data = await res.json()

        if (data.transactions.length !== 2) throw new Error(`Expected 2 transactions, got ${data.transactions.length}`)
        console.log('Fetch All Verified.');

        // 4. Fetch with Filter
        // Let's assume the previous steps created 'DEPOSIT' type transactions.
        console.log('Fetching ROI Transactions (Should be 0)...');
        res = await fetch(`${BASE_URL}/transactions?type=ROI`, { headers: { 'Cookie': cookie } })
        data = await res.json()
        if (data.transactions.length !== 0) throw new Error('Expected 0 ROI transactions')
        console.log('Filter Verified.');

        console.log('Filter Verified.');

        // 5. Verify Admin Global View
        console.log('Creating Admin User...');
        const adminEmail = `admin_tx_${Date.now()}@test.com`
        const regAdmin = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin', name: 'Admin Tx', mobile: Math.floor(Math.random() * 1e9).toString() })
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

        console.log('Admin fetching ALL transactions...');
        // We expect at least the 2 we created for the first user
        const resAdmin = await fetch(`${BASE_URL}/transactions?all=true&limit=100`, { headers: { 'Cookie': cookieAdmin } })
        const dataAdmin = await resAdmin.json()

        // We should find our specific transactions from step 2
        const found = dataAdmin.transactions.filter(t => t.user.email === email)
        if (found.length !== 2) throw new Error(`Admin failed to see User's transactions. Found ${found.length}, expected 2.`)

        console.log('Admin Global View Verified.');

        console.log('SUCCESS: Transactions API Verified.');

    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
