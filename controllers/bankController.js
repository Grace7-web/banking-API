const bankService = require("../services/bankService");

/**
 * @controller BankController
 * Handles HTTP requests for bank operations.
 * Delegates all business logic to BankService.
 */

/**
 * POST /banks
 * Creates a new bank.
 */
const createBank = async (req, res, next) => {
  try {
    const bank = await bankService.createBank(req.body);
    return res.status(201).json({
      success: true,
      message: "Banque créée avec succès",
      data: bank,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /banks
 * Lists all banks.
 */
const getAllBanks = async (req, res, next) => {
  try {
    const banks = await bankService.getAllBanks();
    return res.status(200).json({
      success: true,
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /banks/:id
 * Returns a single bank by ID.
 */
const getBankById = async (req, res, next) => {
  try {
    const bank = await bankService.getBankById(req.params.id);
    return res.status(200).json({
      success: true,
      data: bank,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBank, getAllBanks, getBankById };
