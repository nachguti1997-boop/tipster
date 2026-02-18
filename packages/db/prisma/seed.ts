import { PrismaClient, Role, LinkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean up (optional, currently just creating new entries if not exist, or failing if unique constraints hit)
    // For MVP, we might want to just upsert or fail. Let's try upsert mostly or checking for existence.

    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltOrRounds);

    // --- 1. Business Owner User ---
    const businessUserEmail = 'business@example.com';
    const businessUser = await prisma.user.upsert({
        where: { email: businessUserEmail },
        update: {},
        create: {
            email: businessUserEmail,
            passwordHash,
            role: Role.BUSINESS,
        },
    });

    // --- 2. Business Profile ---
    const businessProfile = await prisma.businessProfile.upsert({
        where: { userId: businessUser.id },
        update: {},
        create: {
            userId: businessUser.id,
            companyName: 'Bar Manolo',
            address: 'Calle Mayor 1, Madrid',
            logoUrl: 'https://via.placeholder.com/150',
        },
    });

    console.log(`✅ Business created: ${businessProfile.companyName}`);

    // --- 3. Worker 1 (Belongs to Bar Manolo) ---
    const worker1Email = 'worker1@example.com';
    const worker1User = await prisma.user.upsert({
        where: { email: worker1Email },
        update: {},
        create: {
            email: worker1Email,
            passwordHash,
            role: Role.WORKER,
        },
    });

    const worker1Profile = await prisma.workerProfile.upsert({
        where: { userId: worker1User.id },
        update: {},
        create: {
            userId: worker1User.id,
            businessId: businessProfile.id,
            linkStatus: LinkStatus.ACTIVE,
            displayName: 'Pepe Camarero',
            qrSlug: 'pepe-bar-manolo',
            bio: 'El mejor tirando cañas.',
        },
    });
    console.log(`✅ Worker 1 created: ${worker1Profile.displayName} (qrSlug: ${worker1Profile.qrSlug})`);

    // --- 4. Worker 2 (Independent / Freelancer) ---
    const worker2Email = 'worker2@example.com';
    const worker2User = await prisma.user.upsert({
        where: { email: worker2Email },
        update: {},
        create: {
            email: worker2Email,
            passwordHash,
            role: Role.WORKER,
        },
    });

    const worker2Profile = await prisma.workerProfile.upsert({
        where: { userId: worker2User.id },
        update: {},
        create: {
            userId: worker2User.id,
            linkStatus: LinkStatus.NONE, // No business linked
            displayName: 'Marta Cantante',
            qrSlug: 'marta-music',
            bio: 'Música en vivo para eventos.',
        },
    });
    console.log(`✅ Worker 2 created: ${worker2Profile.displayName} (qrSlug: ${worker2Profile.qrSlug})`);

    // --- 5. Client User ---
    const clientEmail = 'client@example.com';
    await prisma.user.upsert({
        where: { email: clientEmail },
        update: {},
        create: {
            email: clientEmail,
            passwordHash,
            role: Role.CLIENT,
        },
    });
    console.log(`✅ Client created: ${clientEmail}`);

    console.log('🚀 Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
