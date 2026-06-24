const { prisma } = require("./setup");
const { createAccount } = require("../../services/accountService");

describe.skip("createAccount Integration Test", () => {
  it("devrait créer un compte avec succès dans la base de données", async () => {
    // Créer une banque unique pour ce test
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Test 1",
        code: "TEST1"
      }
    });
    
    const data = {
      ownerName: "Jean Dupont",
      email: "jean@test.com",
      bankId: bank.id,
      currency: "XOF",
      password: "motdepasse123"
    };
    
    const account = await createAccount(data);
    
    // Vérifier que le compte existe dans la base
    const dbAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    expect(dbAccount).toBeTruthy();
    expect(dbAccount.ownerName).toBe(data.ownerName);
    expect(dbAccount.email).toBe(data.email);
    expect(dbAccount.balance).toBe(0);
    expect(dbAccount.status).toBe("active");
  });
  
  it("devrait lancer une erreur si le titulaire a déjà un compte dans cette banque", async () => {
    // Créer une banque unique pour ce test
    const bank = await prisma.bank.create({
      data: {
        name: "Banque Test 2",
        code: "TEST2"
      }
    });
    
    const data = {
      ownerName: "Marie Martin",
      email: "marie@test.com",
      bankId: bank.id,
      currency: "EUR"
    };
    
    await createAccount(data);
    
    await expect(createAccount(data)).rejects.toThrow(
      "Ce titulaire possède déjà un compte dans cette banque"
    );
  });
});
