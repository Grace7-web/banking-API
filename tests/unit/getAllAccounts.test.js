const prisma = require("../../config/db");
const { getAllAccounts } = require("../../services/accountService");

describe("getAllAccounts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("doit retourner tous les comptes triés par date de création décroissante", async () => {
    const fakeAccounts = [
      {
        id: "acc1",
        ownerName: "Jean Dupont",
        accountNumber: "ACC-001",
        balance: 1000,
        currency: "XOF",
        status: "active",
        bank: { name: "Banque X", code: "BX" },
        createdAt: new Date("2025-01-02"),
      },
      {
        id: "acc2",
        ownerName: "Marie Martin",
        accountNumber: "ACC-002",
        balance: 2000,
        currency: "XOF",
        status: "active",
        bank: { name: "Banque Y", code: "BY" },
        createdAt: new Date("2025-01-01"),
      },
    ];

    vi.spyOn(prisma.account, "findMany").mockResolvedValue(fakeAccounts);

    const result = await getAllAccounts();

    expect(prisma.account.findMany).toHaveBeenCalledWith({
      include: {
        bank: {
          select: { name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toEqual(fakeAccounts);
  });
});
