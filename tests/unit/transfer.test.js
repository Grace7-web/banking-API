const prisma = require("../../config/db");
const { transfer } = require("../../services/transactionService");

describe("transfer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit effectuer un transfert entre deux comptes valides", async () => {
    const fromAccount = {
      id: "fromAcc123",
      accountNumber: "ACC-FROM",
      balance: 10000,
      currency: "XOF",
      status: "active",
    };
    const toAccount = {
      id: "toAcc456",
      accountNumber: "ACC-TO",
      balance: 5000,
      currency: "XOF",
      status: "active",
    };
    const updatedFromAccount = { ...fromAccount, balance: 7000 };
    const updatedToAccount = { ...toAccount, balance: 8000 };

    vi.spyOn(prisma.account, "findUnique")
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);
    vi.spyOn(prisma.account, "update")
      .mockResolvedValueOnce(updatedFromAccount)
      .mockResolvedValueOnce(updatedToAccount);
    vi.spyOn(prisma.transaction, "create")
      .mockResolvedValueOnce({ id: "txOut", type: "withdrawal" })
      .mockResolvedValueOnce({ id: "txIn", type: "deposit" });
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    const result = await transfer("fromAcc123", "toAcc456", 3000, "Transfert");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.fromAccount.balance).toBe(7000);
    expect(result.toAccount.balance).toBe(8000);
  });

  it("doit utiliser la description par défaut si aucune description n'est fournie pour le transfert", async () => {
    const fromAccount = {
      id: "fromAcc789",
      accountNumber: "ACC-FROM-DEF",
      balance: 15000,
      currency: "XOF",
      status: "active",
    };
    const toAccount = {
      id: "toAcc012",
      accountNumber: "ACC-TO-DEF",
      balance: 3000,
      currency: "XOF",
      status: "active",
    };
    const updatedFromAccount = { ...fromAccount, balance: 12000 };
    const updatedToAccount = { ...toAccount, balance: 6000 };

    vi.spyOn(prisma.account, "findUnique")
      .mockResolvedValueOnce(fromAccount)
      .mockResolvedValueOnce(toAccount);
    vi.spyOn(prisma.account, "update")
      .mockResolvedValueOnce(updatedFromAccount)
      .mockResolvedValueOnce(updatedToAccount);
    vi.spyOn(prisma.transaction, "create")
      .mockResolvedValueOnce({ id: "txOutDef", type: "withdrawal" })
      .mockResolvedValueOnce({ id: "txInDef", type: "deposit" });
    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb) => cb(prisma));

    await transfer("fromAcc789", "toAcc012", 3000);

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: `Transfert vers compte ${toAccount.accountNumber}`
        })
      })
    );
    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: `Transfert reçu du compte ${fromAccount.accountNumber}`
        })
      })
    );
  });

  it("doit lancer une erreur 400 si le montant est inférieur ou égal à 0", async () => {
    await expect(transfer("fromAcc", "toAcc", -500)).rejects.toMatchObject({
      message: "Le montant du transfert doit être supérieur à 0",
      statusCode: 400,
    });
  });

  it("doit lancer une erreur 400 si le compte source et destination sont les mêmes", async () => {
    await expect(transfer("sameAcc", "sameAcc", 1000)).rejects.toMatchObject({
      message: "Le compte source et le compte de destination doivent être différents",
      statusCode: 400,
    });
  });

  it("doit lancer une erreur 404 si un des comptes n'existe pas", async () => {
    vi.spyOn(prisma.account, "findUnique")
      .mockResolvedValueOnce({ id: "fromAcc" })
      .mockResolvedValueOnce(null);

    await expect(transfer("fromAcc", "toAcc", 1000)).rejects.toMatchObject({
      message: "Un des comptes n'a pas été trouvé",
      statusCode: 404,
    });
  });

  it("doit lancer une erreur 403 si un des comptes n'est pas actif", async () => {
    vi.spyOn(prisma.account, "findUnique")
      .mockResolvedValueOnce({ id: "fromAcc", status: "active" })
      .mockResolvedValueOnce({ id: "toAcc", status: "suspended" });

    await expect(transfer("fromAcc", "toAcc", 1000)).rejects.toMatchObject({
      message: "Les deux comptes doivent être actifs pour effectuer un transfert",
      statusCode: 403,
    });
  });

  it("doit lancer une erreur 422 si le solde est insuffisant", async () => {
    vi.spyOn(prisma.account, "findUnique")
      .mockResolvedValueOnce({ id: "fromAcc", balance: 500, status: "active" })
      .mockResolvedValueOnce({ id: "toAcc", balance: 1000, status: "active" });

    await expect(transfer("fromAcc", "toAcc", 1000)).rejects.toMatchObject({
      statusCode: 422,
    });
  });
});
