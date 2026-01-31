import prisma from '@/lib/prisma'
import { SYSTEM_CONFIG, TRANSACTION_TYPES, WALLET_TYPES } from '@/lib/config'

export async function distributeReferralCommission(userId: string, investAmount: number) {
    try {
        // 1. Get User with Referrer
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referrerId: true, name: true }
        })

        if (!user || !user.referrerId) return

        // --- LEVEL 1 (Direct) ---
        const referrerL1 = await prisma.user.findUnique({
            where: { id: user.referrerId },
            include: { wallets: true } // Need structure? Or just update
        })

        if (referrerL1) {
            const commL1 = investAmount * SYSTEM_CONFIG.REFERRAL_COMMISSION.LEVEL_1
            await processCommission(referrerL1.id, commL1, 1, user.name || 'User')

            // --- LEVEL 2 (Indirect) ---
            if (referrerL1.referrerId) {
                const referrerL2 = await prisma.user.findUnique({
                    where: { id: referrerL1.referrerId }
                })
                if (referrerL2) {
                    const commL2 = investAmount * SYSTEM_CONFIG.REFERRAL_COMMISSION.LEVEL_2
                    await processCommission(referrerL2.id, commL2, 2, user.name || 'User')

                    // --- LEVEL 3 (Deep) ---
                    if (referrerL2.referrerId) {
                        const referrerL3 = await prisma.user.findUnique({
                            where: { id: referrerL2.referrerId }
                        })
                        if (referrerL3) {
                            const commL3 = investAmount * SYSTEM_CONFIG.REFERRAL_COMMISSION.LEVEL_3
                            await processCommission(referrerL3.id, commL3, 3, user.name || 'User')
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('Referral Distribution Error:', error)
    }
}

async function processCommission(userId: string, amount: number, level: number, sourceName: string) {
    if (amount <= 0) return

    // Find or Create REFERRAL or INR wallet? Usually Commission goes to separate wallet or INR.
    // Let's assume commissions go to 'INR' wallet for withdrawals unless specified.
    // Or 'ROI' wallet? Config says 'SALARY', 'ROI'. Let's use 'INR' for liquid cash.
    const targetWalletType = WALLET_TYPES.INR

    // Update Wallet
    await prisma.wallet.upsert({
        where: {
            userId_type: {
                userId: userId,
                type: targetWalletType
            }
        },
        update: {
            balance: { increment: amount }
        },
        create: {
            userId: userId,
            type: targetWalletType,
            balance: amount,
            currency: 'INR'
        }
    })

    // Log Transaction
    await prisma.transaction.create({
        data: {
            userId: userId,
            amount: amount,
            type: TRANSACTION_TYPES.REFERRAL,
            status: 'APPROVED',
            description: `Level ${level} Commission from ${sourceName}`
        }
    })
}
