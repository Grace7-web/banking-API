const prisma = require("../../config/db");
const { deposit } = require("../../services/transactionService");

describe("deposit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit effectuer le dépôt et retourner la transaction si tout est valide", async () => {
    const fakeAccount = {
      id: "acc123",
      balance: 1000,
      currency: "XOF",
      status: "active",
    };

    const fakeUpdatedAccount = { ...fakeAccount, balance: 6000 };

    const fakeTransaction = {
      id: "tx001",
      type: "deposit",
      amount: 5000,
      balanceBefore: 1000,
      balanceAfter: 6000,
    };

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.account, "update").mockResolvedValue(fakeUpdatedAccount);
    vi.spyOn(prisma.transaction, "create").mockResolvedValue(fakeTransaction);
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    const result = await deposit("acc123", 5000, "Dépôt salaire");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc123" },
      data: { balance: 6000 }
    });
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "deposit", amount: 5000 }) })
    );
    expect(result.transaction.type).toBe("deposit");
    expect(result.account.balance).toBe(6000);
  });

  it("CAS 2 : doit lancer une erreur 404 si le compte n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(deposit("acc_inexistant", 5000)).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });

  it("CAS 3 : doit lancer une erreur 403 si le compte n'est pas actif", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 1000,
      status: "suspended",
    });

    await expect(deposit("acc123", 5000)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("CAS 4 : doit lancer une erreur 400 si le montant est inférieur ou égal à 0", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
      balance: 1000,
      status: "active",
    });

    await expect(deposit("acc123", -100)).rejects.toMatchObject({
      message: "Le montant du dépôt doit être supérieur à 0",
      statusCode: 400,
    });
  });

  it("CAS 5 : doit utiliser la description par défaut si aucune description n'est fournie", async () => {
    const fakeAccount = {
      id: "acc789",
      balance: 2000,
      currency: "XOF",
      status: "active",
    };

    const fakeUpdatedAccount = { ...fakeAccount, balance: 4500 };

    const fakeTransaction = {
      id: "tx003",
      type: "deposit",
      amount: 2500,
      balanceBefore: 2000,
      balanceAfter: 4500,
    };

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.account, "update").mockResolvedValue(fakeUpdatedAccount);
    vi.spyOn(prisma.transaction, "create").mockResolvedValue(fakeTransaction);
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    await deposit("acc789", 2500);

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: "Dépôt" }) })
    );
  });
});
