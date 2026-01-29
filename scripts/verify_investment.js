// Node 18+ has native fetch

const BASE_URL = 'http://localhost:3000/api';
let cookie = '';
let userId = '';

async function login() {
    console.log('Logging in...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const cookieHeader = res.headers.get('set-cookie');
    cookie = cookieHeader.split(';')[0];
    userId = data.user.id;
    console.log('Logged in as:', data.user.name);
}

async function createPlan() {
    console.log('Creating Plan...');
    const res = await fetch(`${BASE_URL}/admin/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            name: 'Test Plan',
            minAmount: 100,
            roiPercent: 10,
            duration: 30,
            description: 'Test Description'
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    console.log('Plan Created:', data.plan.id);
    return data.plan.id;
}

async function checkBalances() {
    const res = await fetch(`${BASE_URL}/wallet/balance`, {
        headers: { 'Cookie': cookie }
    });
    return (await res.json()).balances;
}

async function fundWallet(amount) {
    // Helper to fund wallet for testing purchase
    // We'll use the deposit/approve flow manually or just assume we have funds from previous tests
    // Let's create a quick deposit flow here to be safe
    console.log(`Funding Wallet with ${amount}...`);
    const depositRes = await fetch(`${BASE_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ type: 'USDT', amount, description: 'Test Fund' })
    });
    const tx = (await depositRes.json()).transaction;

    await fetch(`${BASE_URL}/admin/deposits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ transactionId: tx.id, status: 'APPROVED' })
    });
    console.log('Wallet Funded.');
}

async function testPurchase(planId) {
    console.log('--- Testing Purchase (Logic: 80/20 Breakdown) ---');
    const initial = await checkBalances();
    const investAmount = 100;

    console.log(`Initial Balances: USDT=${initial.USDT}, Breakdown=${initial.BREAKDOWN || 0}`);

    console.log(`Purchasing Plan for ${investAmount} USDT...`);
    const res = await fetch(`${BASE_URL}/investments/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ planId, amount: investAmount, walletType: 'USDT' })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);
    console.log('Purchase Successful.');

    const final = await checkBalances();
    console.log(`Final Balances: USDT=${final.USDT}, Breakdown=${final.BREAKDOWN}`);

    // VERIFICATION LOGIC
    // 1. USDT should decrease by 100
    // 2. Breakdown should increase by 80 (80% of 100)

    const usdtDiff = (initial.USDT || 0) - final.USDT;
    const breakdownDiff = (final.BREAKDOWN || 0) - (initial.BREAKDOWN || 0);

    if (usdtDiff !== 100) throw new Error(`USDT Calculation Wrong. Expected -100, got -${usdtDiff}`);
    if (breakdownDiff !== 80) throw new Error(`Breakdown Calculation Wrong. Expected +80, got +${breakdownDiff}`);

    console.log('SUCCESS: Purchase Logic Verified (80/20 Split Correct).');
}

async function main() {
    try {
        await login();
        const planId = await createPlan();
        await fundWallet(200); // Ensure enough funds
        await testPurchase(planId);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
