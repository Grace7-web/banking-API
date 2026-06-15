const prisma = require('./config/db');

async function main() {
  console.log('Seeding banks...');
  
  // Supprimer les anciennes banques créées précédemment
  await prisma.bank.deleteMany({
    where: {
      code: { in: ['BNI01', 'SGCI01'] }
    }
  });

  await prisma.bank.upsert({
    where: { code: 'CCA01' },
    update: {},
    create: {
      name: 'CCA Bank',
      code: 'CCA01',
      address: 'Cameroun'
    }
  });

  await prisma.bank.upsert({
    where: { code: 'AFRILAND01' },
    update: {},
    create: {
      name: 'Afriland First Bank',
      code: 'AFRILAND01',
      address: 'Cameroun'
    }
  });

  console.log('2 banques créées avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
