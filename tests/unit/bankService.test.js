const prisma = require("../../config/db");
const { createBank, getAllBanks, getBankById } = require("../../services/bankService");

describe("BankService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createBank", () => {
    it("doit créer une banque avec succès", async () => {
      const data = { name: "Test Bank", code: "TEST", address: "123 Test St" };
      const fakeBank = { id: "bank123", ...data };

      vi.spyOn(prisma.bank, "findFirst").mockResolvedValue(null);
      vi.spyOn(prisma.bank, "create").mockResolvedValue(fakeBank);

      const result = await createBank(data);

      expect(prisma.bank.findFirst).toHaveBeenCalled();
      expect(prisma.bank.create).toHaveBeenCalled();
      expect(result.name).toBe("Test Bank");
    });

    it("doit lancer une erreur 409 si le nom existe déjà", async () => {
      const data = { name: "Existing Bank", code: "NEW" };

      vi.spyOn(prisma.bank, "findFirst").mockResolvedValue({ id: "existing" });

      await expect(createBank(data)).rejects.toMatchObject({
        message: "Une banque avec ce nom ou ce code existe déjà",
        statusCode: 409,
      });
    });

    it("doit lancer une erreur 409 si le code existe déjà", async () => {
      const data = { name: "New Bank", code: "EXISTING" };

      vi.spyOn(prisma.bank, "findFirst").mockResolvedValue({ id: "existing" });

      await expect(createBank(data)).rejects.toMatchObject({
        message: "Une banque avec ce nom ou ce code existe déjà",
        statusCode: 409,
      });
    });

    it("doit convertir le code en majuscules", async () => {
      const data = { name: "Test Bank", code: "test", address: "123 Test St" };
      const fakeBank = { id: "bank123", name: "Test Bank", code: "TEST", address: "123 Test St" };

      vi.spyOn(prisma.bank, "findFirst").mockResolvedValue(null);
      vi.spyOn(prisma.bank, "create").mockResolvedValue(fakeBank);

      await createBank(data);

      expect(prisma.bank.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: "TEST" })
        })
      );
    });
  });

  describe("getAllBanks", () => {
    it("doit retourner toutes les banques triées par nom", async () => {
      const fakeBanks = [
        { id: "b1", name: "Banque B", code: "B", _count: { accounts: 2 } },
        { id: "b2", name: "Banque A", code: "A", _count: { accounts: 1 } }
      ];

      vi.spyOn(prisma.bank, "findMany").mockResolvedValue(fakeBanks);

      const result = await getAllBanks();

      expect(prisma.bank.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        include: { _count: { select: { accounts: true } } }
      });
      expect(result[0].accounts).toBe(2);
    });
  });

  describe("getBankById", () => {
    it("doit retourner une banque par son ID", async () => {
      const fakeBank = { id: "bank123", name: "Test Bank", code: "TEST", _count: { accounts: 5 } };

      vi.spyOn(prisma.bank, "findUnique").mockResolvedValue(fakeBank);

      const result = await getBankById("bank123");

      expect(result.accounts).toBe(5);
      expect(result.name).toBe("Test Bank");
    });

    it("doit lancer une erreur 404 si la banque n'existe pas", async () => {
      vi.spyOn(prisma.bank, "findUnique").mockResolvedValue(null);

      await expect(getBankById("nonexistent")).rejects.toMatchObject({
        message: "Banque non trouvée",
        statusCode: 404,
      });
    });
  });
});
