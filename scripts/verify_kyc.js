const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // 1. Register User (User K)
        const email = `kyc_${Date.now()}@test.com`
        const reg = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass', name: 'KYC User', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())
        const userK = reg.user

        const login = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'pass' })
        })
        const cookieK = login.headers.get('set-cookie').split(';')[0]

        console.log('User Registered:', email)

        // 2. Submit KYC
        console.log('Submitting KYC...')
        await fetch(`${BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieK },
            body: JSON.stringify({ kycDocument: 'AADHAAR-1234' })
        })

        // 3. Create & Login Admin
        const adminEmail = `admin_kyc_${Date.now()}@test.com`
        // Register standard user first
        const regAdmin = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin', name: 'Admin KYC', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        // Manually update role to ADMIN -> Wait, we can't via API.
        // We need an existing admin or a way to make admin.
        // Prisma access in script? No, script is external.
        // BUT, I can rely on the fact that I likely have 'admin@roi.com' from seed or manually created?
        // OR, I can use the 'verify_auth.sh' approach where I might have created one.
        // Actually, for this specific verification environment, I'll use a known trick or just assume the first user is admin? No logic for that.
        // Let's use the DB directly via Prisma in the script? No, it's JS.
        // I will use a special "SETUP" endpoint or just fail if no admin?
        // Wait, I can use the `prisma` CLI to make the user admin in the script `exec`.

        console.log('Creating Admin via CLI...')
        const { execSync } = require('child_process');
        // We know the ID from regAdmin.user.id
        // However, regAdmin.user might be returned now (I changed it).
        if (regAdmin.user && regAdmin.user.id) {
            execSync(`npx prisma db execute --stdin <<EOF
UPDATE User SET role = 'ADMIN' WHERE id = '${regAdmin.user.id}';
EOF`)
        } else {
            // Fallback if my Register API change didn't persist or something? 
            // It did persist.
            throw new Error('Could not create admin user')
        }

        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: 'admin' })
        })
        const cookieAdmin = adminLogin.headers.get('set-cookie').split(';')[0]

        // 4. Admin Approves
        console.log('Admin Approving KYC...')
        const approve = await fetch(`${BASE_URL}/admin/users/${userK.id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookieAdmin },
            body: JSON.stringify({ action: 'APPROVE_KYC' })
        })

        if (approve.status !== 200) {
            const txt = await approve.text()
            throw new Error('Admin Approve Failed: ' + txt)
        }

        // 5. Verify User Status
        console.log('Verifying Status...')
        const profile = await fetch(`${BASE_URL}/user/profile`, {
            headers: { 'Cookie': cookieK }
        }).then(r => r.json())

        if (profile.user.kycStatus !== 'APPROVED') {
            throw new Error(`Expected APPROVED, got ${profile.user.kycStatus}`)
        }

        console.log('SUCCESS: KYC Flow Verified.')

    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
