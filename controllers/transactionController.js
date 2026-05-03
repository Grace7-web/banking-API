const transactionService = require("../services/transactionService");

/**
 * @controller TransactionController
 * Handles HTTP requests for deposit, withdrawal, and transaction history.
 */

/**
 * POST /accounts/:id/deposit
 * Makes a deposit into an account.
 */
const deposit = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await transactionService.deposit(
      req.params.id,
      amount,
      description
    );
    return res.status(200).json({
      success: true,
      message: `Dépôt de ${amount} ${result.account.currency} effectué avec succès`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /accounts/:id/withdrawal
 * Makes a withdrawal from an account.
 */
const withdrawal = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const result = await transactionService.withdrawal(
      req.params.id,
      amount,
      description
    );
    return res.status(200).json({
      success: true,
      message: `Retrait de ${amount} ${result.account.currency} effectué avec succès`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /accounts/:id/transactions
 * Returns the transaction history of an account.
 */
const getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactionHistory(
      req.params.id
    );
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { deposit, withdrawal, getTransactionHistory };
