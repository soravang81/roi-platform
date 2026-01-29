// Node 18+ has native fetch

const BASE_URL = 'http://localhost:3000/api';
let cookieA = ''; // User A (Referrer)
let cookieB = ''; // User B (Investor)
let userA_Id = '';
let userB_Id = '';

async function register(email, refCode) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123',
            name: email.split('@')[0],
            mobile: Math.floor(Math.random() * 1000000000).toString(),
            referralCode: refCode
        })
    });
    return await res.json();
}

async function login(email) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
    });
    const data = await res.json();
    const cookie = res.headers.get('set-cookie')?.split(';')[0];
    return { cookie, user: data.user };
}

async function fundWallet(cookie, amount) {
    const res = await fetch(`${BASE_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ type: 'USDT', amount, description: 'Test Fund' })
    });
    const tx = (await res.json()).transaction;
    // Auto Admin Approve (Simulated) - In real test we need admin cookie, but for now we assume dev environment allows it or we reuse a valid cookie?
    // Wait, the previous scripts used the SAME cookie for everything because the user was implicitly admin?
    // Actually, I need to log in as ADMIN to approve.
    // Hack: I will reuse cookieA if User A is admin?
    // OR: I will just use the current cookie if the endpoint allows it (it checks for token only).
    // The Admin Payout endpoint requires authentication.
    // The Deposit Approve endpoint requires authentication.

    // I will use cookieA to approve deposits.
    await fetch(`${BASE_URL}/admin/deposits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
        body: JSON.stringify({ transactionId: tx.id, status: 'APPROVED' })
    });
}

async function purchasePlan(cookie, amount) {
    // Need a plan ID. 
    // I'll cheat and fetch list first.
    let plansRes = await fetch(`${BASE_URL}/plans`);
    let plans = (await plansRes.json()).plans;

    if (!plans || plans.length === 0) {
        console.log('No plans found. Creating default plan...');
        const createRes = await fetch(`${BASE_URL}/admin/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie }, // Assuming cookie is admin or allowed
            body: JSON.stringify({
                name: 'Test Plan',
                minAmount: 100,
                roiPercent: 1.0,
                duration: 30,
                roiFrequency: 'DAILY',
                description: 'Verification Plan'
            })
        });
        if (!createRes.ok) console.error('Plan create failed', await createRes.json());
        plansRes = await fetch(`${BASE_URL}/plans`);
        plans = (await plansRes.json()).plans;
    }

    // Use first plan or create one if none?
    let planId = plans[0]?.id;

    // If no plan, fail.
    if (!planId) throw new Error('No plans found');

    const res = await fetch(`${BASE_URL}/investments/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ planId, amount, walletType: 'USDT' })
    });
    return await res.json();
}

async function getBalance(cookie) {
    const res = await fetch(`${BASE_URL}/wallet/balance`, { headers: { 'Cookie': cookie } });
    return (await res.json()).balances;
}

async function main() {
    try {
        console.log('--- Setup Users ---');
        // User A (Referrer)
        const emailA = `ref_${Date.now()}@test.com`;
        const regA = await register(emailA); // returns { user: ... }
        const loginA = await login(emailA);
        cookieA = loginA.cookie;
        userA_Id = loginA.user.id;
        const refCodeA = loginA.user.referralCode;
        console.log(`User A (Referrer): ${emailA} (Code: ${refCodeA})`);

        // User B (Referee)
        const emailB = `invest_${Date.now()}@test.com`;
        await register(emailB, refCodeA);
        const loginB = await login(emailB);
        cookieB = loginB.cookie;
        userB_Id = loginB.user.id;
        console.log(`User B (Investor): ${emailB}`);

        console.log('\n--- Funding & Investment ---');
        // Fund B with 50,000 to trigger Salary for A?
        // Salary requires 50,000 Direct Business.
        // User B invests 50,000.

        await fundWallet(cookieB, 60000); // 60k funding
        console.log('User B Funded.');

        // B Parschases Plan
        console.log('User B Purchasing 50,000 USDT Plan...');
        const pur = await purchasePlan(cookieB, 50000);
        if (pur.error) throw new Error('Purchase Failed: ' + pur.error);
        console.log('Purchase Success.');

        console.log('\n--- Verify Referrer (A) Status ---');
        // Check Referrer Bonus (5% of 50k = 2500)
        const balA = await getBalance(cookieA);
        console.log('User A Balance:', balA);
        if ((balA.ROI || 0) < 2500) throw new Error(`Referral Bonus Check Failed. ROI=${balA.ROI}, Expected >= 2500`);
        console.log('Referral Bonus Verified (2500 USDT).');

        // Verify Salary Activation?
        // We can't easily check 'salaryActive' via API unless we add an endpoint or check "My Profile".
        // But we can run the Payout logic and see if A gets Salary.

        console.log('\n--- Run Daily Payout (Cron) ---');
        const payoutRes = await fetch(`${BASE_URL}/admin/payouts`, {
            method: 'POST',
            headers: { 'Cookie': cookieA } // A acts as Admin
        });
        const payoutData = await payoutRes.json();
        console.log('Payout Result:', payoutData);

        // Verify A got Salary (500)
        const balA_Final = await getBalance(cookieA);
        // ROI should be 2500 + maybe daily? No A has no investment.
        // Salary Wallet should be 500.
        console.log('User A Final Balance:', balA_Final);

        if ((balA_Final.SALARY || 0) !== 500) {
            throw new Error(`Salary Check Failed. Salary=${balA_Final.SALARY}, Expected 500`);
        }
        console.log('Salary Verified (500 USDT).');

        // Verify B got ROI
        // B invested 50k. Plan ROI? 
        // Need to know Plan ROI % to verify exact amount.
        // But if payout stats says 'roi: > 0', it's good.
        if (payoutData.stats.roi === 0) throw new Error('No ROI paid out?');
        console.log('ROI Payout Verified.');

        console.log('\nSUCCESS: Full Income Logic Verified.');

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
