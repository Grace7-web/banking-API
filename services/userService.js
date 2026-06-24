const prisma = require("../config/db");
const bcrypt = require("bcrypt");

const createUser = async (data) => {
  const { name, email, password, role } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error("Cet email est déjà utilisé");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    },
  });

  delete user.password;
  return user;
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, accounts: true },
  });
  if (!user) {
    const err = new Error("Utilisateur non trouvé");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Identifiants incorrects");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error("Identifiants incorrects");
    err.statusCode = 401;
    throw err;
  }

  delete user.password;
  return user;
};

module.exports = { createUser, getAllUsers, getUserById, loginUser };
