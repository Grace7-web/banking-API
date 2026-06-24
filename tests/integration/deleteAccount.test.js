const { prisma } = require("./setup");
const { deleteAccount } = require("../../services/accountService");

describe.skip("deleteAccount Integration Test", () => {
  it("devrait supprimer un compte avec succès si le solde est à 0", async () => {
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Delete Test 1",
        code: "DEL1"
      }
    });
    
    const account = await prisma.account.create({
      data: {
        accountNumber: "ACC-TEST-004",
        ownerName: "Anna Test",
        bankId: bank.id,
        balance: 0,
        currency: "XOF"
      }
    });
    
    const result = await deleteAccount(account.id);
    
    expect(result.message).toBe("Compte supprimé avec succès");
    
    // Vérifier que le compte n'existe plus
    const dbAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    expect(dbAccount).toBeNull();
  });
  
  it("devrait lancer une erreur si le solde n'est pas à 0", async () => {
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Delete Test 2",
        code: "DEL2"
      }
    });
    
    const account = await prisma.account.create({
      data: {
        accountNumber: "ACC-TEST-005",
        ownerName: "Tom Test",
        bankId: bank.id,
        balance: 10000,
        currency: "XOF"
      }
    });
    
    await expect(deleteAccount(account.id)).rejects.toThrow(
      "Solde non nul : 10000 XOF. Retirez le solde d'abord."
    );
    
    // Vérifier que le compte existe toujours
    const dbAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    expect(dbAccount).toBeTruthy();
  });
});
