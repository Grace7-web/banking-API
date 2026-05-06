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
  const existingAccount = await Account.findOne({ ownerName, bankId });
  
  if (existingAccount) {
    const err = new Error("Ce titulaire possède déjà un compte dans cette banque");
    err.statusCode = 409;
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
const getAllAccounts = async () => {

  const accounts = await Account.find()
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

const checkBalance = async (accountId) => {
  const account = await Account.findById(accountId);
 

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

module.exports = { createAccount, getAllAccounts, deleteAccount, checkBalance };