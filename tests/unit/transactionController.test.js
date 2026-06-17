const transactionController = require("../../controllers/transactionController");
const transactionService = require("../../services/transactionService");

describe("TransactionController", () => {
  let req, res, next;

  beforeEach(() => {
    vi.restoreAllMocks();
    req = { params: {}, body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe("deposit", () => {
    it("doit effectuer un dépôt avec succès (200)", async () => {
      const fakeResult = {
        account: { currency: "XOF" },
        transaction: { id: "tx1" }
      };
      vi.spyOn(transactionService, "deposit").mockResolvedValue(fakeResult);
      req.params.id = "acc123";
      req.body = { amount: 50000, description: "Salaire" };

      await transactionController.deposit(req, res, next);

      expect(transactionService.deposit).toHaveBeenCalledWith("acc123", 50000, "Salaire");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: fakeResult
      }));
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(transactionService, "deposit").mockRejectedValue(testError);
      req.params.id = "acc123";
      req.body = {};

      await transactionController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("withdrawal", () => {
    it("doit effectuer un retrait avec succès (200)", async () => {
      const fakeResult = {
        account: { currency: "XOF" },
        transaction: { id: "tx1" }
      };
      vi.spyOn(transactionService, "withdrawal").mockResolvedValue(fakeResult);
      req.params.id = "acc123";
      req.body = { amount: 10000, description: "Courses" };

      await transactionController.withdrawal(req, res, next);

      expect(transactionService.withdrawal).toHaveBeenCalledWith("acc123", 10000, "Courses");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: fakeResult
      }));
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(transactionService, "withdrawal").mockRejectedValue(testError);
      req.params.id = "acc123";
      req.body = {};

      await transactionController.withdrawal(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("getTransactionHistory", () => {
    it("doit retourner l'historique des transactions (200)", async () => {
      const fakeTransactions = [
        { id: "tx1", type: "deposit" },
        { id: "tx2", type: "withdrawal" }
      ];
      vi.spyOn(transactionService, "getTransactionHistory").mockResolvedValue(fakeTransactions);
      req.params.id = "acc123";

      await transactionController.getTransactionHistory(req, res, next);

      expect(transactionService.getTransactionHistory).toHaveBeenCalledWith("acc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: fakeTransactions
      });
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(transactionService, "getTransactionHistory").mockRejectedValue(testError);
      req.params.id = "acc123";

      await transactionController.getTransactionHistory(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  describe("transfer", () => {
    it("doit effectuer un transfert avec succès (200)", async () => {
      const fakeResult = { transferOut: {}, transferIn: {} };
      vi.spyOn(transactionService, "transfer").mockResolvedValue(fakeResult);
      req.body = {
        fromAccountId: "acc1",
        toAccountId: "acc2",
        amount: 5000,
        description: "Remboursement"
      };

      await transactionController.transfer(req, res, next);

      expect(transactionService.transfer).toHaveBeenCalledWith("acc1", "acc2", 5000, "Remboursement");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: fakeResult
      }));
    });

    it("doit retourner 400 si les comptes ne sont pas fournis", async () => {
      req.body = { amount: 5000 };

      await transactionController.transfer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Les comptes source et destination sont requis"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("doit appeler next() en cas d'erreur", async () => {
      const testError = new Error("Erreur de test");
      vi.spyOn(transactionService, "transfer").mockRejectedValue(testError);
      req.body = {
        fromAccountId: "acc1",
        toAccountId: "acc2",
        amount: 5000
      };

      await transactionController.transfer(req, res, next);

      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});
