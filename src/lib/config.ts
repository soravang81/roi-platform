export const SYSTEM_CONFIG = {
    // Investment Breakdown
    BREAKDOWN_PERCENTAGE: 0.80, // 80% goes to Breakdown Wallet

    // Referral Commissions (Percentage of Investment Amount)
    REFERRAL_COMMISSION: {
        LEVEL_1: 0.05, // 5% Direct
        LEVEL_2: 0.02, // 2% Indirect
        LEVEL_3: 0.01  // 1% Level 3
    },

    // ROI Boost
    ROI_BOOST: {
        REFERRAL_COUNT_THRESHOLD: 50,
        BOOST_PERCENTAGE: 2.0 // +2% ROI
    },

    // Salary Qualification
    SALARY: {
        QUALIFICATION_HOURS: 72,
        PAID_USER_TARGET: 2,
        FREE_USER_TARGET: 10
    }
}

export const TRANSACTION_TYPES = {
    DEPOSIT: 'DEPOSIT',
    WITHDRAWAL: 'WITHDRAWAL',
    ROI: 'ROI',
    SALARY: 'SALARY',
    REFERRAL: 'REFERRAL',
    REFUND: 'REFUND',
    PLAN_PURCHASE: 'PLAN_PURCHASE',
    BREAKDOWN_CREDIT: 'BREAKDOWN_CREDIT'
}

export const WALLET_TYPES = {
    INR: 'INR',
    USDT: 'USDT',
    ROI: 'ROI',
    SALARY: 'SALARY',
    BREAKDOWN: 'BREAKDOWN'
}
