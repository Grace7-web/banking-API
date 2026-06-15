const prisma = require("../../config/db");
const { checkBalance } = require("../../services/accountService");

describe("checkBalance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit retourner le solde si le compte est actif", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      accountNumber: "ACC-001",
      ownerName: "Jean Dupont",
      balance: 10000,
      currency: "XOF",
      status: "active",
    });

    const result = await checkBalance("acc123");

    expect(result.balance).toBe(10000);
    expect(result.currency).toBe("XOF");
    expect(result.ownerName).toBe("Jean Dupont");
  });

  it("CAS 2 : doit lancer une erreur 404 si le compte n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(checkBalance("acc_inexistant")).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });

  it("CAS 3 : doit lancer une erreur 403 si le compte n'est pas actif", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      accountNumber: "ACC-001",
      ownerName: "Jean Dupont",
      balance: 0,
      currency: "XOF",
      status: "suspended",
    });

    await expect(checkBalance("acc123")).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
