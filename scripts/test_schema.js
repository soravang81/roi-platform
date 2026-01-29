const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Checking Schema...')
        // Create a dummy user
        const user = await prisma.user.create({
            data: {
                email: 'schema_test_' + Date.now() + '@test.com',
                password: 'pass',
                referralCode: 'SCHEMA' + Date.now()
            }
        })
        console.log('User created:', user.id)

        // Update directBusiness
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { directBusiness: 100 }
        })
        console.log('Updated directBusiness:', updated.directBusiness)

    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
