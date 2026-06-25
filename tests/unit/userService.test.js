const prisma = require("../../config/db");
const bcrypt = require("bcrypt");
const { createUser, getAllUsers, getUserById, loginUser } = require("../../services/userService");

vi.mock("bcrypt");

describe("userService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createUser", () => {
    it("doit créer un utilisateur avec succès", async () => {
      const userData = { name: "Test", email: "test@test.com", password: "password123" };
      const hashedPassword = "hashed123";
      const fakeUser = { id: "1", ...userData, password: hashedPassword, role: "user" };

      vi.spyOn(bcrypt, "hash").mockResolvedValue(hashedPassword);
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      vi.spyOn(prisma.user, "create").mockResolvedValue(fakeUser);

      const result = await createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: "user",
        },
      });
      expect(result.password).toBeUndefined(); // Should not return password
    });

    it("doit lancer une erreur si email déjà pris", async () => {
      const userData = { name: "Test", email: "test@test.com", password: "password123" };

      vi.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: "1", email: "test@test.com" });

      await expect(createUser(userData)).rejects.toThrow("Cet email est déjà utilisé");
    });
  });

  describe("getAllUsers", () => {
    it("doit retourner tous les utilisateurs sans password", async () => {
      const fakeUsers = [
        { id: "1", name: "Test1", email: "test1@test.com" },
        { id: "2", name: "Test2", email: "test2@test.com" },
      ];

      vi.spyOn(prisma.user, "findMany").mockResolvedValue(fakeUsers);

      const result = await getAllUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      result.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe("getUserById", () => {
    it("doit retourner un utilisateur par son ID sans password", async () => {
      const fakeUser = { id: "1", name: "Test", email: "test@test.com" };

      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);

      const result = await getUserById("1");

      expect(result.password).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: { id: true, name: true, email: true, role: true, createdAt: true, accounts: true },
      });
    });

    it("doit lancer une erreur 404 si utilisateur non trouvé", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      await expect(getUserById("999")).rejects.toThrow("Utilisateur non trouvé");
    });
  });

  describe("loginUser", () => {
    it("doit connecter un utilisateur avec succès", async () => {
      const email = "test@test.com";
      const password = "password123";
      const hashedPassword = "hashed123";
      const fakeUser = { id: "1", name: "Test", email, password: hashedPassword, role: "user" };

      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await loginUser(email, password);

      expect(result.password).toBeUndefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it("doit lancer une erreur 404 si utilisateur non trouvé", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      await expect(loginUser("wrong@test.com", "pass")).rejects.toThrow("Identifiants incorrects");
    });

    it("doit lancer une erreur 401 si mot de passe incorrect", async () => {
      const fakeUser = { id: "1", name: "Test", email: "test@test.com", password: "hashed123", role: "user" };

      vi.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await expect(loginUser("test@test.com", "wrongpass")).rejects.toThrow("Identifiants incorrects");
    });
  });
});
