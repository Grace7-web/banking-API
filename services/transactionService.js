const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

/**
 * @service TransactionService
 * Handles deposit and withdrawal operations with strict validation.
 */

/**
 * FUNCTION 4 — deposit
 * Performs a deposit on an active account.
 *
 * Control Flow:
 * 1. Find the account by ID → 404 if not found
 * 2. Check account status is "active" → 403 if suspended/closed
 * 3. Validate amount > 0 → 400 if invalid
 * 4. Calculate new balance (balanceBefore + amount)
 * 5. Update account balance atomically
 * 6. Record the transaction
 * 7. Return transaction with updated account
 *
 * @param {string} accountId
 * @param {number} amount
 * @param {string} description
 * @returns {Promise<{transaction: Transaction, account: Account}>}
 */
const deposit = async (accountId, amount, description = "") => {
  // Step 1 — Find account
  const account = await Account.findById(accountId);
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

  // Step 4 — Calculate new balance
  const balanceBefore = account.balance;
  const balanceAfter = parseFloat((balanceBefore + amount).toFixed(2));

  // Step 5 — Update account balance
  account.balance = balanceAfter;
  await account.save();

  // Step 6 — Record transaction
  const transaction = await Transaction.create({
    accountId,
    type: "deposit",
    amount,
    balanceBefore,
    balanceAfter,
    description: description || "Dépôt",
  });

  // Step 7 — Return result
  return { transaction, account };
};

/**
 * FUNCTION 5 — withdrawal
 * Performs a withdrawal from an active account.
 *
 * Control Flow:
 * 1. Find the account by ID → 404 if not found
 * 2. Check account status is "active" → 403 if suspended/closed
 * 3. Validate amount > 0 → 400 if invalid
 * 4. Check sufficient balance (balance >= amount) → 422 if insufficient
 * 5. Calculate new balance (balanceBefore - amount)
 * 6. Update account balance atomically
 * 7. Record the transaction
 * 8. Return transaction with updated account
 *
 * @param {string} accountId
 * @param {number} amount
 * @param {string} description
 * @returns {Promise<{transaction: Transaction, account: Account}>}
 */
const withdrawal = async (accountId, amount, description = "") => {
  // Step 1 — Find account
  const account = await Account.findById(accountId);
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

  // Step 5 — Calculate new balance
  const balanceBefore = account.balance;
  const balanceAfter = parseFloat((balanceBefore - amount).toFixed(2));

  // Step 6 — Update account balance
  account.balance = balanceAfter;
  await account.save();

  // Step 7 — Record transaction
  const transaction = await Transaction.create({
    accountId,
    type: "withdrawal",
    amount,
    balanceBefore,
    balanceAfter,
    description: description || "Retrait",
  });

  // Step 8 — Return result
  return { transaction, account };
};

/**
 * Returns transaction history for an account.
 * @param {string} accountId
 * @returns {Promise<Transaction[]>}
 */
const getTransactionHistory = async (accountId) => {
  const account = await Account.findById(accountId);
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
    throw err;
  }

  const transactions = await Transaction.find({ accountId })
    .sort({ createdAt: -1 })
    .limit(100);

  return transactions;
};

module.exports = { deposit, withdrawal, getTransactionHistory };
