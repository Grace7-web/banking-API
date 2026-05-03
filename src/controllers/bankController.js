// src/controllers/bankController.js

const { db, uuidv4 } = require('../models/database');

/**
 * Créer une banque
 */
const createBank = (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: 'name et code sont obligatoires'
    });
  }

  // Vérifier unicité du code
  const exists = Object.values(db.banks).find(
    b => b.code.toUpperCase() === code.toUpperCase()
  );
  if (exists) {
    return res.status(409).json({
      success: false,
      message: `Une banque avec le code ${code} existe déjà`
    });
  }

  const bankId = uuidv4();
  const bank = {
    id: bankId,
    name: name.trim(),
    code: code.toUpperCase().trim(),
    createdAt: new Date().toISOString()
  };

  db.banks[bankId] = bank;

  return res.status(201).json({
    success: true,
    message: 'Banque créée avec succès',
    data: bank
  });
};

/**
 * Lister les banques
 */
const listBanks = (req, res) => {
  const banks = Object.values(db.banks);
  return res.status(200).json({
    success: true,
    count: banks.length,
    data: banks
  });
};

module.exports = { createBank, listBanks };
