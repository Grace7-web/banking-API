const accountController = require("../../controllers/accountController");
const accountService = require("../../services/accountService");

describe("AccountController", () => {
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

  describe("createAccount", () => {
    it("doit créer un compte avec succès (201)", async () => {
      const fakeAccount = { id: "acc123", ownerName: "Jean Dupont" };
      vi.spyOn(accountService, "createAccount").mockResolvedValue(fakeAccount);
      req.body = { ownerName: "Jean Dupont", bankId: "bank123" };

      await accountController.createAccount(req, res, next);

      expect(accountService.createAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Compte bancaire créé avec succès",
        data: fakeAccount
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(accountService, "createAccount").mockRejectedValue(testError);
      req.body = {};

      await accountController.createAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("getAllAccounts", () => {
    it("doit retourner tous les comptes (200)", async () => {
      const fakeAccounts = [
        { id: "acc1", ownerName: "Jean" },
        { id: "acc2", ownerName: "Marie" }
      ];
      vi.spyOn(accountService, "getAllAccounts").mockResolvedValue(fakeAccounts);
      req.query = {};

      await accountController.getAllAccounts(req, res, next);

      expect(accountService.getAllAccounts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: fakeAccounts
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(accountService, "getAllAccounts").mockRejectedValue(testError);
      req.query = {};

      await accountController.getAllAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("deleteAccount", () => {
    it("doit supprimer un compte avec succès (200)", async () => {
      const fakeResult = {
        deletedAccountId: "acc123",
        accountNumber: "ACC-001",
        ownerName: "Jean Dupont",
        message: "Compte supprimé avec succès"
      };
      vi.spyOn(accountService, "deleteAccount").mockResolvedValue(fakeResult);
      req.params = { id: "acc123" };
      req.body = { userId: "user123", isAdmin: true };

      await accountController.deleteAccount(req, res, next);

      expect(accountService.deleteAccount).toHaveBeenCalledWith("acc123", "user123", true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Compte supprimé avec succès",
        data: fakeResult
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(accountService, "deleteAccount").mockRejectedValue(testError);
      req.params = { id: "acc123" };
      req.body = { userId: "user123", isAdmin: true };

      await accountController.deleteAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("checkBalance", () => {
    it("doit vérifier le solde avec succès (200)", async () => {
      const fakeResult = {
        accountNumber: "ACC-001",
        ownerName: "Jean Dupont",
        balance: 50000,
        currency: "XOF"
      };
      vi.spyOn(accountService, "checkBalance").mockResolvedValue(fakeResult);
      req.params = { id: "acc123" };

      await accountController.checkBalance(req, res, next);

      expect(accountService.checkBalance).toHaveBeenCalledWith("acc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeResult
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(accountService, "checkBalance").mockRejectedValue(testError);
      req.params = { id: "acc123" };

      await accountController.checkBalance(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});
