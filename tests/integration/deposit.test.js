const { prisma } = require("./setup");
const { deposit } = require("../../services/transactionService");

describe.skip("deposit Integration Test", () => {
  it("devrait effectuer un dépôt et mettre à jour le solde du compte", async () => {
    // Créer une banque et un compte de test
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Dépôt Test",
        code: "DEPOT"
      }
    });
    
    const account = await prisma.account.create({
      data: {
        accountNumber: "ACC-TEST-001",
        ownerName: "Paul Test",
        bankId: bank.id,
        balance: 0,
        currency: "XOF"
      }
    });
    
    const amount = 50000;
    await deposit(account.id, amount, "Dépôt test");
    
    // Vérifier le solde mis à jour
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    expect(updatedAccount.balance).toBe(amount);
    
    // Vérifier que la transaction a été enregistrée
    const transaction = await prisma.transaction.findFirst({
      where: { accountId: account.id }
    });
    
    expect(transaction).toBeTruthy();
    expect(transaction.type).toBe("deposit");
    expect(transaction.amount).toBe(amount);
    expect(transaction.balanceBefore).toBe(0);
    expect(transaction.balanceAfter).toBe(amount);
  });
});
