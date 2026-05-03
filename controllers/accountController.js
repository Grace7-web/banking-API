const accountService = require("../services/accountService");

/**
 * @controller AccountController
 * Handles HTTP requests for account operations.
 */

/**
 * POST /accounts
 * Creates a new bank account.
 */
const createAccount = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.body);
    return res.status(201).json({
      success: true,
      message: "Compte bancaire créé avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /accounts
 * Lists all accounts (with optional filters: bankId, status).
 */
const getAllAccounts = async (req, res, next) => {
  try {
    const { bankId, status } = req.query;
    const accounts = await accountService.getAllAccounts({ bankId, status });
    return res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /accounts/:id
 * Returns a single account by ID.
 */
const deleteAccount = async (req, res, next) => {
  try {
    const result = await accountService.deleteAccount(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAccount, getAllAccounts, deleteAccount };
