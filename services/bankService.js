const Bank = require("../models/Bank");

/**
 * @service BankService
 * Handles all business logic related to banks.
 */

/**
 * Creates a new bank.
 * @param {Object} bankData - { name, code, address }
 * @returns {Promise<Bank>} The created bank document.
 * @throws {Error} 409 if name or code already exists.
 */
const createBank = async (bankData) => {
  const { name, code, address } = bankData;

  const existing = await Bank.findOne({
    $or: [{ name }, { code: code.toUpperCase() }],
  });

  if (existing) {
    const err = new Error(
      "Une banque avec ce nom ou ce code existe déjà"
    );
    err.statusCode = 409;
    throw err;
  }

  const bank = await Bank.create({ name, code, address });
  return bank;
};

/**
 * Returns all banks, sorted by name.
 * @returns {Promise<Bank[]>}
 */
const getAllBanks = async () => {
  const banks = await Bank.find().sort({ name: 1 });
  return banks;
};

/**
 * Returns a single bank by its ID.
 * @param {string} bankId
 * @returns {Promise<Bank>}
 * @throws {Error} 404 if not found.
 */
const getBankById = async (bankId) => {
  const bank = await Bank.findById(bankId);

  if (!bank) {
    const err = new Error("Banque non trouvée");
    err.statusCode = 404;
    throw err;
  }

  return bank;
};

module.exports = { createBank, getAllBanks, getBankById };
