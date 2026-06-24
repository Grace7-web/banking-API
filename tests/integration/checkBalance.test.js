const { prisma } = require("./setup");
const { checkBalance } = require("../../services/accountService");

describe.skip("checkBalance Integration Test", () => {
  it("devrait renvoyer le solde correct du compte", async () => {
    const bank = await prisma.bank.create({
      data: {
        name: "Banque CheckBalance Test",
        code: "CHECK"
      }
    });
    
    const account = await prisma.account.create({
      data: {
        accountNumber: "ACC-TEST-003",
        ownerName: "Luc Test",
        bankId: bank.id,
        balance: 250000,
        currency: "XOF"
      }
    });
    
    const result = await checkBalance(account.id);
    
    expect(result.accountNumber).toBe(account.accountNumber);
    expect(result.ownerName).toBe(account.ownerName);
    expect(result.balance).toBe(250000);
    expect(result.currency).toBe("XOF");
  });
  
  it("devrait lancer une erreur si le compte n'existe pas", async () => {
    await expect(checkBalance("id-inexistant")).rejects.toThrow(
      "Compte bancaire non trouvé"
    );
  });
});
