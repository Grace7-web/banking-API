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
    const { userId } = req.query;
    const accounts = await accountService.getAllAccounts(userId || null);
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
    const { userId, isAdmin } = req.body;
    const result = await accountService.deleteAccount(req.params.id, userId, isAdmin || false);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const suspendAccount = async (req, res, next) => {
  try {
    const { isAdmin } = req.body;
    const account = await accountService.suspendAccount(req.params.id, isAdmin || false);
    return res.status(200).json({
      success: true,
      message: "Compte désactivé avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    const { isAdmin } = req.body;
    const account = await accountService.activateAccount(req.params.id, isAdmin || false);
    return res.status(200).json({
      success: true,
      message: "Compte activé avec succès",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const checkBalance = async (req, res, next) => {
  try {
    const result = await accountService.checkBalance(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAccount, getAllAccounts, deleteAccount, suspendAccount, activateAccount, checkBalance };
