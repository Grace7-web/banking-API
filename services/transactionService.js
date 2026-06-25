const prisma = require("../config/db");

/**
 * @service TransactionService
 * Handles deposit and withdrawal operations with strict validation.
 */

/**
 * FUNCTION 4 — deposit
 */
const deposit = async (accountId, amount, description = "") => {
  // Step 1 — Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  // Step 2 — Check account status
  if (account.status !== "active") {
    const err = new Error(
      `Opération impossible : le compte est "${account.status}"`
    );
    err.statusCode = 403;
    throw err;
  }

  // Step 3 — Validate amount
  if (!amount || amount <= 0) {
    const err = new Error("Le montant du dépôt doit être supérieur à 0");
    err.statusCode = 400;
    throw err;
  }

  const balanceBefore = account.balance;
  const balanceAfter = parseFloat((balanceBefore + amount).toFixed(2));

  // Step 5 & 6 — Update account balance and record transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter }
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId,
        type: "deposit",
        amount,
        balanceBefore,
        balanceAfter,
        description: description || "Dépôt",
      }
    });

    return { transaction, account: updatedAccount };
  });

  return result;
};

/**
 * FUNCTION 5 — withdrawal
 */
const withdrawal = async (accountId, amount, description = "") => {
  // Step 1 — Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  // Step 2 — Check account status
  if (account.status !== "active") {
    const err = new Error(
      `Opération impossible : le compte est "${account.status}"`
    );
    err.statusCode = 403;
    throw err;
  }

  // Step 3 — Validate amount
  if (!amount || amount <= 0) {
    const err = new Error("Le montant du retrait doit être supérieur à 0");
    err.statusCode = 400;
    throw err;
  }

  // Step 4 — Check sufficient balance
  if (account.balance < amount) {
    const err = new Error(
      `Solde insuffisant. Solde disponible : ${account.balance} ${account.currency}`
    );
    err.statusCode = 422;
    throw err;
  }

  const balanceBefore = account.balance;
  const balanceAfter = parseFloat((balanceBefore - amount).toFixed(2));

  // Step 6 & 7 — Update account balance and record transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: { balance: balanceAfter }
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId,
        type: "withdrawal",
        amount,
        balanceBefore,
        balanceAfter,
        description: description || "Retrait",
      }
    });

    return { transaction, account: updatedAccount };
  });

  return result;
};

/**
 * Returns transaction history for an account.
 * @param {string} accountId
 * @returns {Promise<Transaction[]>}
 */
const getTransactionHistory = async (accountId) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return transactions;
};

/**
 * FUNCTION 6 — transfer
 * Interbank or intrabank transfer
 */
const transfer = async (fromAccountId, toAccountId, amount, description = "") => {
  if (!amount || amount <= 0) {
    const err = new Error("Le montant du transfert doit être supérieur à 0");
    err.statusCode = 400;
    throw err;
  }
  
  if (fromAccountId === toAccountId) {
    const err = new Error("Le compte source et le compte de destination doivent être différents");
    err.statusCode = 400;
    throw err;
  }

  const fromAccount = await prisma.account.findUnique({ where: { id: fromAccountId } });
  const toAccount = await prisma.account.findUnique({ where: { id: toAccountId } });

  if (!fromAccount || !toAccount) {
    const err = new Error("Un des comptes n'a pas été trouvé");
    err.statusCode = 404;
    throw err;
  }

  if (fromAccount.status !== "active" || toAccount.status !== "active") {
    const err = new Error("Les deux comptes doivent être actifs pour effectuer un transfert");
    err.statusCode = 403;
    throw err;
  }

  if (fromAccount.balance < amount) {
    const err = new Error(`Solde insuffisant. Solde disponible : ${fromAccount.balance} ${fromAccount.currency}`);
    err.statusCode = 422;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    const fromBalanceAfter = parseFloat((fromAccount.balance - amount).toFixed(2));
    const toBalanceAfter = parseFloat((toAccount.balance + amount).toFixed(2));

    const updatedFromAccount = await tx.account.update({
      where: { id: fromAccountId },
      data: { balance: fromBalanceAfter }
    });

    const updatedToAccount = await tx.account.update({
      where: { id: toAccountId },
      data: { balance: toBalanceAfter }
    });

    const transferOut = await tx.transaction.create({
      data: {
        accountId: fromAccountId,
        type: "withdrawal",
        amount,
        balanceBefore: fromAccount.balance,
        balanceAfter: fromBalanceAfter,
        description: description || `Transfert vers compte ${toAccount.accountNumber}`,
      }
    });

    const transferIn = await tx.transaction.create({
      data: {
        accountId: toAccountId,
        type: "deposit",
        amount,
        balanceBefore: toAccount.balance,
        balanceAfter: toBalanceAfter,
        description: description || `Transfert reçu du compte ${fromAccount.accountNumber}`,
      }
    });

    return { transferOut, transferIn, fromAccount: updatedFromAccount, toAccount: updatedToAccount };
  });

  return result;
};

/**
 * Returns ALL transactions (admin only)
 * @returns {Promise<Transaction[]>}
 */
const getAllTransactions = async () => {
  const transactions = await prisma.transaction.findMany({
    include: {
      account: {
        include: {
          bank: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return transactions;
};

module.exports = { deposit, withdrawal, getTransactionHistory, transfer, getAllTransactions };
