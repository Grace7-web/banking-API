const prisma = require("../../config/db");
const { getTransactionHistory } = require("../../services/transactionService");

describe("getTransactionHistory", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit retourner l'historique des transactions si le compte existe", async () => {
    const fakeAccount = { id: "acc123", accountNumber: "ACC-001" };
    const fakeTransactions = [
      { id: "tx1", type: "deposit", amount: 1000 },
      { id: "tx2", type: "withdrawal", amount: 500 },
    ];

    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
    vi.spyOn(prisma.transaction, "findMany").mockResolvedValue(fakeTransactions);

    const result = await getTransactionHistory("acc123");

    expect(prisma.account.findUnique).toHaveBeenCalledWith({
      where: { id: "acc123" },
    });
    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: { accountId: "acc123" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    expect(result).toEqual(fakeTransactions);
  });

  it("doit lancer une erreur 404 si le compte n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

    await expect(getTransactionHistory("acc_inexistant")).rejects.toMatchObject({
      message: "Compte bancaire non trouvé",
      statusCode: 404,
    });
  });
});
