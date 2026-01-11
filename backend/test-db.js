const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "mongodb+srv://swatejapatil1_db_user:swateja@cluster0.flzlbdq.mongodb.net/conference-app?retryWrites=true&w=majority&appName=Cluster0"
        }
    }
});

async function main() {
    try {
        await prisma.$connect();
        console.log("Successfully connected to database");
        const users = await prisma.user.findMany();
        console.log("Users found:", users.length);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
