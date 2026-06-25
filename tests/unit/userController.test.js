const { createUser, getAllUsers, getUserById, loginUser } = require("../../controllers/userController");
const userService = require("../../services/userService");

describe("userController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.restoreAllMocks();
  });

  describe("createUser", () => {
    it("doit créer un utilisateur et retourner 201", async () => {
      req.body = { name: "Test", email: "test@test.com", password: "password123" };
      const fakeUser = { id: "1", ...req.body };
      delete fakeUser.password;
      
      vi.spyOn(userService, "createUser").mockResolvedValue(fakeUser);

      await createUser(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Utilisateur créé avec succès",
        data: fakeUser,
      });
    });

    it("doit appeler next(error) en cas d'erreur", async () => {
      const error = new Error("Erreur");
      vi.spyOn(userService, "createUser").mockRejectedValue(error);

      await createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllUsers", () => {
    it("doit retourner tous les utilisateurs", async () => {
      const fakeUsers = [{ id: "1", name: "Test" }];
      vi.spyOn(userService, "getAllUsers").mockResolvedValue(fakeUsers);

      await getAllUsers(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: fakeUsers,
      });
    });

    it("doit appeler next(error) en cas d'erreur", async () => {
      const error = new Error("Erreur");
      vi.spyOn(userService, "getAllUsers").mockRejectedValue(error);

      await getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserById", () => {
    it("doit retourner un utilisateur par son ID", async () => {
      req.params.id = "1";
      const fakeUser = { id: "1", name: "Test" };
      vi.spyOn(userService, "getUserById").mockResolvedValue(fakeUser);

      await getUserById(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: fakeUser,
      });
    });

    it("doit appeler next(error) en cas d'erreur", async () => {
      const error = new Error("Erreur");
      vi.spyOn(userService, "getUserById").mockRejectedValue(error);

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("loginUser", () => {
    it("doit connecter un utilisateur avec succès", async () => {
      req.body = { email: "test@test.com", password: "password123" };
      const fakeUser = { id: "1", email: "test@test.com" };
      vi.spyOn(userService, "loginUser").mockResolvedValue(fakeUser);

      await loginUser(req, res, next);

      expect(userService.loginUser).toHaveBeenCalledWith("test@test.com", "password123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Connexion réussie",
        data: fakeUser,
      });
    });

    it("doit appeler next(error) en cas d'erreur", async () => {
      const error = new Error("Erreur");
      vi.spyOn(userService, "loginUser").mockRejectedValue(error);

      await loginUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
