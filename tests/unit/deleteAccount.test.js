const prisma = require("../../config/db");
const { deleteAccount } = require("../../services/accountService");

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit supprimer le compte si le solde est à 0 et le statut n'est pas closed (admin)", async () => {
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

    const result = await deleteAccount("acc123", null, true);

    expect(prisma.account.delete).toHaveBeenCalledWith({ where: { id: "acc123" } });
    expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({ where: { accountId: "acc123" } });
    expect(result.message).toBe("Compte supprimé avec succès");
  });

  it("CAS 2 : doit lancer une erreur 404 si le compte n'existe pas (admin)", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(deleteAccount("acc_inexistant", null, true)).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });

  it("CAS 3 : doit lancer une erreur 422 si le solde est supérieur à 0 (admin)", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 5000,
      currency: "XOF",
      status: "active",
    });

    await expect(deleteAccount("acc123", null, true)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("CAS 4 : doit lancer une erreur 409 si le compte est déjà fermé (admin)", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 0,
      currency: "XOF",
      status: "closed",
    });

    await expect(deleteAccount("acc123", null, true)).rejects.toMatchObject({
      message: "Ce compte est déjà fermé",
      statusCode: 409,
    });
  });

  it("CAS 5 : doit lancer une erreur 403 si pas admin", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      id: "acc123",
      balance: 0,
      status: "active",
    });

    await expect(deleteAccount("acc123", "user123", false)).rejects.toMatchObject({
      message: "Seul un administrateur peut supprimer un compte",
      statusCode: 403,
    });
  });
});
