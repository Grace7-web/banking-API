const prisma = require("../config/db");
const { v4: uuidv4 } = require("uuid");

/**
 * @service AccountService
 * Handles all business logic related to bank accounts.
 */

const generateAccountNumber = () => {
  return `ACC-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
};

/**
 * FUNCTION 1 — createAccount
 */
const createAccount = async (data) => {
  const { ownerName, email, bankId, currency, password, userId } = data;
  
  const existingAccount = await prisma.account.findFirst({ 
    where: { ownerName, bankId } 
  });
  
  if (existingAccount) {
    const err = new Error("Ce titulaire possède déjà un compte dans cette banque");
    err.statusCode = 409;
    throw err;
  }
  
  const account = await prisma.account.create({
    data: {
      accountNumber: generateAccountNumber(),
      ownerName,
      email,
      password,
      bankId,
      userId,
      currency: currency || "XOF",
    },
    include: {
      bank: {
        select: { name: true, code: true }
      }
    }
  });
  
  // On ne renvoie pas le mot de passe pour la sécurité
  delete account.password;
  
  return account;
};

/**
 * FUNCTION 2 — getAllAccounts
 */
const getAllAccounts = async (userId = null) => {
  const where = userId ? { userId } : {};
  const accounts = await prisma.account.findMany({
    where,
    include: {
      bank: {
        select: { name: true, code: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return accounts;
};

/**
 * FUNCTION 3 — deleteAccount
 */
const deleteAccount = async (accountId, userId = null, isAdmin = false) => {
  // Step 1 — Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  // Check if user is admin only
  if (!isAdmin) {
    const err = new Error("Seul un administrateur peut supprimer un compte");
    err.statusCode = 403;
    throw err;
  }

  // Step 2 — Check balance is zero
  if (account.balance > 0) {
    const err = new Error(`Solde non nul : ${account.balance} ${account.currency}. Retirez le solde d'abord.`);
    err.statusCode = 422;
    throw err;
  }

  // Step 3 — Check not already closed
  if (account.status === "closed") {
    const err = new Error("Ce compte est déjà fermé");
    err.statusCode = 409;
    throw err;
  }

  // Step 4 & 5 — Delete account (Cascade will delete transactions automatically if configured, or we can do it explicitly)
  await prisma.transaction.deleteMany({
    where: { accountId }
  });

  await prisma.account.delete({
    where: { id: accountId }
  });

  // Step 6 — Return confirmation
  return {
    deletedAccountId: accountId,
    accountNumber: account.accountNumber,
    ownerName: account.ownerName,
    message: "Compte supprimé avec succès",
  };
};

const checkBalance = async (accountId) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  if (account.status !== "active") {
    const err = new Error(
      `Consultation impossible : le compte est "${account.status}"`
    );
    err.statusCode = 403;
    throw err;
  }

  return {
    accountNumber: account.accountNumber,
    ownerName: account.ownerName,
    balance: account.balance,
    currency: account.currency,
  };
};

const suspendAccount = async (accountId, isAdmin = false) => {
  // Check if user is admin
  if (!isAdmin) {
    const err = new Error("Seul un administrateur peut désactiver un compte");
    err.statusCode = 403;
    throw err;
  }

  // Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  if (account.status === "suspended") {
    const err = new Error("Ce compte est déjà désactivé");
    err.statusCode = 409;
    throw err;
  }

  if (account.status === "closed") {
    const err = new Error("Ce compte est fermé et ne peut pas être désactivé");
    err.statusCode = 409;
    throw err;
  }

  // Update account status
  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: { status: "suspended" },
    include: {
      bank: {
        select: { name: true, code: true }
      }
    }
  });

  return updatedAccount;
};

const activateAccount = async (accountId, isAdmin = false) => {
  // Check if user is admin
  if (!isAdmin) {
    const err = new Error("Seul un administrateur peut activer un compte");
    err.statusCode = 403;
    throw err;
  }

  // Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });

  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  if (account.status === "active") {
    const err = new Error("Ce compte est déjà activé");
    err.statusCode = 409;
    throw err;
  }

  if (account.status === "closed") {
    const err = new Error("Ce compte est fermé et ne peut pas être activé");
    err.statusCode = 409;
    throw err;
  }

  // Update account status
  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: { status: "active" },
    include: {
      bank: {
        select: { name: true, code: true }
      }
    }
  });

  return updatedAccount;
};

module.exports = { createAccount, getAllAccounts, deleteAccount, checkBalance, suspendAccount, activateAccount };