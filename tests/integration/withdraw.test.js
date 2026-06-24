const { prisma } = require("./setup");
const { withdrawal } = require("../../services/transactionService");

describe.skip("withdraw Integration Test", () => {
  it("devrait effectuer un retrait et mettre à jour le solde du compte", async () => {
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Withdraw Test",
        code: "WITH"
      }
    });
    
    const account = await prisma.account.create({
      data: {
        accountNumber: "ACC-TEST-002",
        ownerName: "Sophie Test",
        bankId: bank.id,
        balance: 100000,
        currency: "XOF"
      }
    });
    
    const withdrawAmount = 30000;
    await withdrawal(account.id, withdrawAmount, "Retrait test");
    
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    expect(updatedAccount.balance).toBe(70000);
    
    // Vérifier la transaction
    const transaction = await prisma.transaction.findFirst({
      where: { accountId: account.id, type: "withdrawal" }
    });
    
    expect(transaction).toBeTruthy();
    expect(transaction.balanceBefore).toBe(100000);
    expect(transaction.balanceAfter).toBe(70000);
  });
});
