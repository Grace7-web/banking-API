// src/models/database.js
// Base de données en mémoire (simulée)
// Structure multi-banque

const db = {
  banks: {},      // { bankId: { id, name, code, createdAt } }
  accounts: {},   // { accountId: { id, bankId, owner, balance, createdAt } }
  transactions: [] // [ { id, type, fromAccountId, toAccountId, amount, date, status } ]
};

// Pré-charger deux banques par défaut
const { v4: uuidv4 } = require('uuid');

const bank1Id = 'bank-001';
const bank2Id = 'bank-002';

db.banks[bank1Id] = {
  id: bank1Id,
  name: 'Banque Centrale du Cameroun',
  code: 'BCC',
  createdAt: new Date().toISOString()
};

db.banks[bank2Id] = {
  id: bank2Id,
  name: 'Afriland First Bank',
  code: 'AFB',
  createdAt: new Date().toISOString()
};

module.exports = { db, uuidv4 };
