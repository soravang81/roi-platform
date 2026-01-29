const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // 1. User Register & Login
        const email = `supp_${Date.now()}@test.com`
        const reg = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass', name: 'Support User', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        const login = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass' })
        })
        const cookieUser = login.headers.get('set-cookie').split(';')[0]

        // 2. Create Ticket
        console.log('Creating Ticket...')
        const tRes = await fetch(`${BASE_URL}/support`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookieUser },
            body: JSON.stringify({ subject: 'Help Me', message: 'I cannot withdraw' })
        }).then(r => r.json())
        const ticketId = tRes.ticket.id
        console.log('Ticket Created:', ticketId)

        // 3. Admin Reply
        // Assuming admin exists from previous runs/seeds. 
        // We reuse the admin logic or rely on known admin.
        // Let's create an admin just in case, similar to kyc script.
        const adminEmail = `admin_sup_${Date.now()}@test.com`
        const regAdmin = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin', name: 'Admin Support', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        const { execSync } = require('child_process');
        if (regAdmin.user && regAdmin.user.id) {
            execSync(`npx prisma db execute --stdin <<EOF
UPDATE User SET role = 'ADMIN' WHERE id = '${regAdmin.user.id}';
EOF`)
        }

        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin' })
        })
        const cookieAdmin = adminLogin.headers.get('set-cookie').split(';')[0]

        console.log('Admin Replying...')
        await fetch(`${BASE_URL}/support/${ticketId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookieAdmin },
            body: JSON.stringify({ message: 'We are looking into it.', status: 'RESOLVED' })
        })

        // 4. Verify User Sees Reply
        console.log('Verifying Reply...')
        const tCheck = await fetch(`${BASE_URL}/support/${ticketId}`, {
            headers: { 'Cookie': cookieUser }
        }).then(r => r.json())

        const messages = tCheck.ticket.messages
        if (messages.length !== 2) throw new Error('Expected 2 messages')
        if (tCheck.ticket.status !== 'RESOLVED') throw new Error('Expected RESOLVED status')

        console.log('SUCCESS: Support Flow Verified')

    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
