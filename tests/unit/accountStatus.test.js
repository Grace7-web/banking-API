const prisma = require("../../config/db");
const { suspendAccount, activateAccount } = require("../../services/accountService");

describe("suspendAccount & activateAccount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("suspendAccount", () => {
    it("doit suspendre un compte si admin", async () => {
      const fakeAccount = {
        id: "acc123",
        status: "active",
      };

      vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
      vi.spyOn(prisma.account, "update").mockResolvedValue({
        ...fakeAccount,
        status: "suspended",
      });

      const result = await suspendAccount("acc123", true);

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: "acc123" },
        data: { status: "suspended" },
        include: { bank: { select: { name: true, code: true } } },
      });
    });

    it("doit lancer une erreur 403 si pas admin", async () => {
      await expect(suspendAccount("acc123", false)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it("doit lancer une erreur 404 si compte inexistant", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

      await expect(suspendAccount("acc_inexistant", true)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("doit lancer une erreur 409 si compte déjà suspendu", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
        id: "acc123",
        status: "suspended",
      });

      await expect(suspendAccount("acc123", true)).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("doit lancer une erreur 409 si compte fermé", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
        id: "acc123",
        status: "closed",
      });

      await expect(suspendAccount("acc123", true)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe("activateAccount", () => {
    it("doit activer un compte si admin", async () => {
      const fakeAccount = {
        id: "acc123",
        status: "suspended",
      };

      vi.spyOn(prisma.account, "findUnique").mockResolvedValue(fakeAccount);
      vi.spyOn(prisma.account, "update").mockResolvedValue({
        ...fakeAccount,
        status: "active",
      });

      const result = await activateAccount("acc123", true);

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: "acc123" },
        data: { status: "active" },
        include: { bank: { select: { name: true, code: true } } },
      });
    });

    it("doit lancer une erreur 403 si pas admin", async () => {
      await expect(activateAccount("acc123", false)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it("doit lancer une erreur 404 si compte inexistant", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue(null);

      await expect(activateAccount("acc_inexistant", true)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("doit lancer une erreur 409 si compte déjà actif", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
        id: "acc123",
        status: "active",
      });

      await expect(activateAccount("acc123", true)).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("doit lancer une erreur 409 si compte fermé", async () => {
      vi.spyOn(prisma.account, "findUnique").mockResolvedValue({
        id: "acc123",
        status: "closed",
      });

      await expect(activateAccount("acc123", true)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });
});
