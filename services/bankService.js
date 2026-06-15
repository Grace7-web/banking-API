const prisma = require("../config/db");

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

  const existing = await prisma.bank.findFirst({
    where: {
      OR: [{ name }, { code: code.toUpperCase() }],
    },
  });

  if (existing) {
    const err = new Error(
      "Une banque avec ce nom ou ce code existe déjà"
    );
    err.statusCode = 409;
    throw err;
  }

  const bank = await prisma.bank.create({
    data: {
      name,
      code: code.toUpperCase(),
      address,
    },
  });
  return bank;
};

/**
 * Returns all banks, sorted by name.
 * @returns {Promise<Bank[]>}
 */
const getAllBanks = async () => {
  const banks = await prisma.bank.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { accounts: true }
      }
    }
  });
  
  // Format the output to match previous virtual property 'accounts'
  return banks.map(bank => ({
    ...bank,
    accounts: bank._count.accounts,
    _count: undefined
  }));
};

/**
 * Returns a single bank by its ID.
 * @param {string} bankId
 * @returns {Promise<Bank>}
 * @throws {Error} 404 if not found.
 */
const getBankById = async (bankId) => {
  const bank = await prisma.bank.findUnique({
    where: { id: bankId },
    include: {
      _count: {
        select: { accounts: true }
      }
    }
  });

  if (!bank) {
    const err = new Error("Banque non trouvée");
    err.statusCode = 404;
    throw err;
  }

  return {
    ...bank,
    accounts: bank._count.accounts,
    _count: undefined
  };
};

module.exports = { createBank, getAllBanks, getBankById };
