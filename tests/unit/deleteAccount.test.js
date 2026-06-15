const prisma = require("../../config/db");
const { deleteAccount } = require("../../services/accountService");

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit supprimer le compte si le solde est à 0 et le statut n'est pas closed", async () => {
    const fakeAccount = {
      id: "acc123",
      ownerName: "Jean Dupont",
      accountNumber: "ACC-001",
      balance: 0,
      currency: "XOF",
      status: "active",
    };

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.account, "delete").mockResolvedValue(true);
    vi.spyOn(prisma.transaction, "deleteMany").mockResolvedValue(true);

    const result = await deleteAccount("acc123");

    expect(prisma.account.delete).toHaveBeenCalledWith({ where: { id: "acc123" } });
    expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({ where: { accountId: "acc123" } });
    expect(result.message).toBe("Compte supprimé avec succès");
  });

  it("CAS 2 : doit lancer une erreur 404 si le compte n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(deleteAccount("acc_inexistant")).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });

  it("CAS 3 : doit lancer une erreur 422 si le solde est supérieur à 0", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 5000,
      currency: "XOF",
      status: "active",
    });

    await expect(deleteAccount("acc123")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("CAS 4 : doit lancer une erreur 409 si le compte est déjà fermé", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 0,
      currency: "XOF",
      status: "closed",
    });

    await expect(deleteAccount("acc123")).rejects.toMatchObject({
      message: "Ce compte est déjà fermé",
      statusCode: 409,
    });
  });
});
