const Account = require("../models/Account");
const Bank = require("../models/Bank");

/**
 * @service AccountService
 * Handles all business logic related to bank accounts.
 */

/**
 * FUNCTION 1 — createAccount
 * Creates a new bank account linked to a bank.
 *
 * Control Flow:
 * 1. Validate that bankId references an existing bank → 404 if not
 * 2. Create the account with default balance 0
 * 3. Return the created account populated with bank info
 *
 * @param {Object} data - { ownerName, bankId, currency }
 * @returns {Promise<Account>}
 */
const createAccount = async (data) => {
  const { ownerName, bankId, currency } = data;

  
  const bank = await Bank.findById(bankId);
  if (!bank) {
    const err = new Error("Banque introuvable, impossible de créer le compte");
    err.statusCode = 404;
    throw err;
  }
  const account = await Account.create({
    ownerName,
    bankId,
    currency: currency || "XOF",
  });
  await account.populate("bankId", "name code");
  return account;
};

/**
 * FUNCTION 2 — getAllAccounts
 * Lists all accounts with optional filtering by bankId or status.
 *
 * Control Flow:
 * 1. Build dynamic filter object from query params
 * 2. Query DB with filter, populate bank info
 * 3. Return list of accounts
 *
 * @param {Object} filters - { bankId?, status? }
 * @returns {Promise<Account[]>}
 */
const getAllAccounts = async (filters = {}) => {
  const query = {};
  if (filters.bankId) {
    query.bankId = filters.bankId;
  }

  if (filters.status) {
    const allowedStatuses = ["active", "suspended", "closed"];
    if (!allowedStatuses.includes(filters.status)) {
      const err = new Error(
        "Statut invalide. Valeurs acceptées : active, suspended, closed"
      );
      err.statusCode = 400;
      throw err;
    }
    query.status = filters.status;
  }
  const accounts = await Account.find(query)
    .populate("bankId", "name code")
    .sort({ createdAt: -1 });

  
  return accounts;
};

/**
 * FUNCTION 3 — getAccountById
 * Returns a single account by ID.
 *
 * Control Flow:
 * 1. Find account by ID → 404 if not found
 * 2. Populate bank info
 * 3. Return account
 *
 * @param {string} accountId
 * @returns {Promise<Account>}
 */
const deleteAccount = async (accountId) => {
  const Transaction = require("../models/Transaction");

  // Step 1 — Find account
  const account = await Account.findById(accountId);
  if (!account) {
    const err = new Error("Compte bancaire non trouvé");
    err.statusCode = 404;
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

  // Step 4 — Delete linked transactions
  await Transaction.deleteMany({ accountId });

  // Step 5 — Delete account
  await Account.findByIdAndDelete(accountId);

  // Step 6 — Return confirmation
  return {
    deletedAccountId: accountId,
    accountNumber: account.accountNumber,
    ownerName: account.ownerName,
    message: "Compte supprimé avec succès",
  };
};

module.exports = { createAccount, getAllAccounts, deleteAccount };