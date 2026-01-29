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

async function requestDeposit(type, amount, desc) {
    console.log(`Requesting ${type} Deposit: ${amount}...`);
    const res = await fetch(`${BASE_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ type, amount, description: desc })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    console.log('Deposit Requested:', data.transaction?.id);
    return data.transaction.id;
}

async function approveDeposit(txId, status) {
    console.log(`Admin acting on Deposit ${txId}: ${status}...`);
    const res = await fetch(`${BASE_URL}/admin/deposits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({ transactionId: txId, status })
    });
    const data = await res.json();
    console.log('Admin Action Result:', data.message);
}

async function checkBalance() {
    const res = await fetch(`${BASE_URL}/wallet/balance`, {
        headers: { 'Cookie': cookie }
    });
    const data = await res.json();
    console.log('Balances:', data.balances);
    return data.balances;
}

async function main() {
    try {
        await login();

        // --- DEPOSIT TEST ---
        console.log('\n--- Testing Deposit ---');
        const initial = await checkBalance();

        const txInr = await requestDeposit('INR', 1000, 'UTR123456');
        // const txUsdt = await requestDeposit('USDT', 100, '0xabc123');

        await approveDeposit(txInr, 'APPROVED');
        // await approveDeposit(txUsdt, 'REJECTED');

        const mid = await checkBalance();

        // --- WITHDRAWAL TEST ---
        console.log('\n--- Testing Withdrawal ---');
        console.log('Requesting Withdrawal 500 INR...');
        const txWithdraw = await fetch(`${BASE_URL}/wallet/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ type: 'INR', amount: 500, address: 'UPI@Reference' })
        }).then(r => r.json());

        if (txWithdraw.error) throw new Error('Withdrawal Failed: ' + txWithdraw.error);
        console.log('Withdrawal Requested:', txWithdraw.result.id);

        const afterWithdrawRequest = await checkBalance();
        if (afterWithdrawRequest.INR !== mid.INR - 500) {
            throw new Error(`Balance Deduct Failed: Expected ${mid.INR - 500}, Got ${afterWithdrawRequest.INR}`);
        } else {
            console.log('Balance successfully deducted for pending withdrawal.');
        }

        // Admin Reject
        console.log('Admin REJECTING Withdrawal...');
        await fetch(`${BASE_URL}/admin/withdrawals`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ transactionId: txWithdraw.result.id, status: 'REJECTED' })
        });

        // Check Balance (Should be refunded)
        const refundBalance = await checkBalance();
        if (refundBalance.INR !== mid.INR) {
            throw new Error(`Refund Failed: Expected ${mid.INR}, Got ${refundBalance.INR}`);
        } else {
            console.log('Refund successful.');
        }

        console.log('\nSUCCESS: All Wallet Tests Passed.');

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
