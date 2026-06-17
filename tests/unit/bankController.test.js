const bankController = require("../../controllers/bankController");
const bankService = require("../../services/bankService");

describe("BankController", () => {
  let req, res, next;

  beforeEach(() => {
    vi.restoreAllMocks();
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe("createBank", () => {
    it("doit créer une banque avec succès (201)", async () => {
      const fakeBank = { id: "bank123", name: "Test Bank", code: "TEST" };
      vi.spyOn(bankService, "createBank").mockResolvedValue(fakeBank);
      req.body = { name: "Test Bank", code: "TEST" };

      await bankController.createBank(req, res, next);

      expect(bankService.createBank).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Banque créée avec succès",
        data: fakeBank
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(bankService, "createBank").mockRejectedValue(testError);
      req.body = {};

      await bankController.createBank(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("getAllBanks", () => {
    it("doit retourner toutes les banques (200)", async () => {
      const fakeBanks = [
        { id: "b1", name: "Banque 1" },
        { id: "b2", name: "Banque 2" }
      ];
      vi.spyOn(bankService, "getAllBanks").mockResolvedValue(fakeBanks);

      await bankController.getAllBanks(req, res, next);

      expect(bankService.getAllBanks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: fakeBanks
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(bankService, "getAllBanks").mockRejectedValue(testError);

      await bankController.getAllBanks(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("getBankById", () => {
    it("doit retourner une banque par son ID (200)", async () => {
      const fakeBank = { id: "bank123", name: "Test Bank" };
      vi.spyOn(bankService, "getBankById").mockResolvedValue(fakeBank);
      req.params = { id: "bank123" };

      await bankController.getBankById(req, res, next);

      expect(bankService.getBankById).toHaveBeenCalledWith("bank123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeBank
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(bankService, "getBankById").mockRejectedValue(testError);
      req.params = { id: "bank123" };

      await bankController.getBankById(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});
