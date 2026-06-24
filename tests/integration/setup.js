const prisma = require("../../config/db");

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Nettoyer la base avant chaque test (dans l'ordre pour les contraintes de clés étrangères)
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.bank.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { prisma };
