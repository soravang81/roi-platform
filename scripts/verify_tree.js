const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        // Need to log in to get a token.
        // We'll use the "Referrer" (User A) from previous tests who definitely has referrals (User B).
        // If script state is lost, we might fail. 
        // But verifying only requires ANY user with referrals.
        // I'll create a fresh chain A -> B -> C to verify depth.

        console.log('--- Setup Referral Chain A->B->C ---');

        // 1. Create A
        const emailA = `tree_root_${Date.now()}@test.com`
        const regA = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailA, password: 'pass', name: 'Root A', mobile: Math.floor(Math.random() * 1e9).toString() })
        }).then(r => r.json())

        const loginA = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailA, password: 'pass' })
        })
        const cookieA = loginA.headers.get('set-cookie').split(';')[0]
        const userA = (await loginA.json()).user

        // 2. Create B (Ref by A)
        const emailB = `tree_child_${Date.now()}@test.com`
        const regB = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailB, password: 'pass', name: 'Child B', mobile: Math.floor(Math.random() * 1e9).toString(), referralCode: userA.referralCode })
        }).then(r => r.json())
        const userB = regB.user

        // 3. Create C (Ref by B)
        // Need B's ref code.
        // B needs to login to get its own code? Or register returns it?  Register returns user object usually.
        // Let's check register response in previous steps... yes it returns { user: ... }.
        // Assuming regB.user has referralCode? If not, login B.
        // The API returns user object. Let's assume it has it.

        const emailC = `tree_grandchild_${Date.now()}@test.com`
        const regC = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailC, password: 'pass', name: 'Grandchild C', mobile: Math.floor(Math.random() * 1e9).toString(), referralCode: userB.referralCode })
        }).then(r => r.json())

        // 4. Fetch Tree for A
        console.log('Fetching Tree for A...');
        const treeRes = await fetch(`${BASE_URL}/referrals/tree`, {
            headers: { 'Cookie': cookieA }
        })
        const treeData = await treeRes.json()

        console.log('Tree Data:', JSON.stringify(treeData, null, 2))

        // Verify Structure
        // Tree should be array with 1 element (B).
        // B should have children array with 1 element (C).

        const nodeB = treeData.tree.find(n => n.email === emailB)
        if (!nodeB) throw new Error('B not found in A\'s tree')

        const nodeC = nodeB.children.find(n => n.email === emailC)
        if (!nodeC) throw new Error('C not found in B\'s children')

        console.log('SUCCESS: Referral Tree Verified (Depth 2).')

    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
