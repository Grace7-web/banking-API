// src/controllers/accountController.js

const { db, uuidv4 } = require('../models/database');

/**
 * FONCTION 1 - Créer un compte bancaire
 */
const createAccount = (req, res) => {
  const { bankId, owner, initialBalance } = req.body;

  // Validation
  if (!bankId || !owner) {
    return res.status(400).json({
      success: false,
      message: 'bankId et owner sont obligatoires'
    });
  }

  // Vérifier que la banque existe
  if (!db.banks[bankId]) {
    return res.status(404).json({
      success: false,
      message: `Banque avec l'id ${bankId} introuvable`
    });
  }

  const balance = parseFloat(initialBalance) || 0;
  if (balance < 0) {
    return res.status(400).json({
      success: false,
      message: 'Le solde initial ne peut pas être négatif'
    });
  }

  const accountId = uuidv4();
  const account = {
    id: accountId,
    bankId,
    bankName: db.banks[bankId].name,
    owner: owner.trim(),
    balance,
    createdAt: new Date().toISOString()
  };

  db.accounts[accountId] = account;

  return res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: account
  });
};

/**
 * FONCTION 2 - Lister tous les comptes (ou par banque)
 */
const listAccounts = (req, res) => {
  const { bankId } = req.query;

  let accounts = Object.values(db.accounts);

  if (bankId) {
    if (!db.banks[bankId]) {
      return res.status(404).json({
        success: false,
        message: `Banque avec l'id ${bankId} introuvable`
      });
    }
    accounts = accounts.filter(a => a.bankId === bankId);
  }

  return res.status(200).json({
    success: true,
    count: accounts.length,
    data: accounts
  });
};

/**
 * Obtenir un compte par ID
 */
const getAccountById = (req, res) => {
  const { id } = req.params;
  const account = db.accounts[id];

  if (!account) {
    return res.status(404).json({
      success: false,
      message: `Compte avec l'id ${id} introuvable`
    });
  }

  return res.status(200).json({
    success: true,
    data: account
  });
};

module.exports = { createAccount, listAccounts, getAccountById };
