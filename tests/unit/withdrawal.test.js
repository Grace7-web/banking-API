const prisma = require("../../config/db");
const { withdrawal } = require("../../services/transactionService");

describe("withdrawal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit effectuer le retrait et retourner la transaction si tout est valide", async () => {
    const fakeAccount = {
      id: "acc123",
      balance: 10000,
      currency: "XOF",
      status: "active",
    };

    const fakeUpdatedAccount = { ...fakeAccount, balance: 7000 };

    const fakeTransaction = {
      id: "tx002",
      type: "withdrawal",
      amount: 3000,
      balanceBefore: 10000,
      balanceAfter: 7000,
    };

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.account, "update").mockResolvedValue(fakeUpdatedAccount);
    vi.spyOn(prisma.transaction, "create").mockResolvedValue(fakeTransaction);
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    const result = await withdrawal("acc123", 3000, "Retrait guichet");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc123" },
      data: { balance: 7000 }
    });
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "withdrawal", amount: 3000 }) })
    );
    expect(result.transaction.type).toBe("withdrawal");
    expect(result.account.balance).toBe(7000);
  });

  it("CAS 2 : doit lancer une erreur 404 si le compte n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(withdrawal("acc_inexistant", 3000)).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });

  it("CAS 3 : doit lancer une erreur 403 si le compte n'est pas actif", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 10000,
      status: "suspended",
    });

    await expect(withdrawal("acc123", 3000)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("CAS 4 : doit lancer une erreur 400 si le montant est inférieur ou égal à 0", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 10000,
      status: "active",
    });

    await expect(withdrawal("acc123", 0)).rejects.toMatchObject({
      message: "Le montant du retrait doit être supérieur à 0",
      statusCode: 400,
    });
  });

  it("CAS 5 : doit lancer une erreur 422 si le solde est insuffisant", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 1000,
      currency: "XOF",
      status: "active",
    });

    await expect(withdrawal("acc123", 5000)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("CAS 6 : doit utiliser la description par défaut si aucune description n'est fournie", async () => {
    const fakeAccount = {
      id: "acc987",
      balance: 8000,
      currency: "XOF",
      status: "active",
    };

    const fakeUpdatedAccount = { ...fakeAccount, balance: 5500 };

    const fakeTransaction = {
      id: "tx004",
      type: "withdrawal",
      amount: 2500,
      balanceBefore: 8000,
      balanceAfter: 5500,
    };

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.account, "update").mockResolvedValue(fakeUpdatedAccount);
    vi.spyOn(prisma.transaction, "create").mockResolvedValue(fakeTransaction);
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    await withdrawal("acc987", 2500);

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: "Retrait" }) })
    );
  });
});
