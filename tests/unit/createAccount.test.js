const prisma = require("../../config/db");
const { createAccount } = require("../../services/accountService");

describe("createAccount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("CAS 1 : doit créer un compte si le titulaire n'en a pas encore dans cette banque", async () => {
    const data = {
      ownerName: "Jean Dupont",
      bankId: "bank123",
      currency: "XOF",
    };

    const fakeAccount = {
      id: "acc123",
      ownerName: "Jean Dupont",
      bankId: "bank123",
      balance: 0,
      currency: "XOF",
      status: "active",
      accountNumber: "ACC-001",
    };

    vi.spyOn(prisma.account, "findFirst").mockResolvedValue(null);
    vi.spyOn(prisma.account, "create").mockResolvedValue(fakeAccount);

    const result = await createAccount(data);

    expect(prisma.account.findFirst).toHaveBeenCalledWith({
      where: {
        ownerName: "Jean Dupont",
        bankId: "bank123",
      }
    });
    expect(prisma.account.create).toHaveBeenCalled();
    expect(result.ownerName).toBe("Jean Dupont");
  });

  it("CAS 2 : doit lancer une erreur 409 si le titulaire a déjà un compte dans cette banque", async () => {
    const data = {
      ownerName: "Jean Dupont",
      bankId: "bank123",
      currency: "XOF",
    };

    vi.spyOn(prisma.account, "findFirst").mockResolvedValue({ id: "existingAcc" });

    await expect(createAccount(data)).rejects.toMatchObject({
      message: "Ce titulaire possède déjà un compte dans cette banque",
      statusCode: 409,
    });
  });
});
