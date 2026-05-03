// src/controllers/transactionController.js

const { db, uuidv4 } = require('../models/database');

/**
 * FONCTION 3 - Dépôt
 */
const deposit = (req, res) => {
  const { accountId, amount } = req.body;

  if (!accountId || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'accountId et amount sont obligatoires'
    });
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être un nombre positif supérieur à 0'
    });
  }

  const account = db.accounts[accountId];
  if (!account) {
    return res.status(404).json({
      success: false,
      message: `Compte ${accountId} introuvable`
    });
  }

  account.balance += parsedAmount;

  const transaction = {
    id: uuidv4(),
    type: 'DEPOT',
    toAccountId: accountId,
    fromAccountId: null,
    amount: parsedAmount,
    balanceAfter: account.balance,
    date: new Date().toISOString(),
    status: 'SUCCESS'
  };

  db.transactions.push(transaction);

  return res.status(200).json({
    success: true,
    message: `Dépôt de ${parsedAmount} effectué avec succès`,
    data: {
      transaction,
      newBalance: account.balance
    }
  });
};

/**
 * FONCTION 4 - Retrait
 */
const withdraw = (req, res) => {
  const { accountId, amount } = req.body;

  if (!accountId || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'accountId et amount sont obligatoires'
    });
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être un nombre positif supérieur à 0'
    });
  }

  const account = db.accounts[accountId];
  if (!account) {
    return res.status(404).json({
      success: false,
      message: `Compte ${accountId} introuvable`
    });
  }

  if (account.balance < parsedAmount) {
    return res.status(400).json({
      success: false,
      message: `Solde insuffisant. Solde actuel: ${account.balance}`
    });
  }

  account.balance -= parsedAmount;

  const transaction = {
    id: uuidv4(),
    type: 'RETRAIT',
    fromAccountId: accountId,
    toAccountId: null,
    amount: parsedAmount,
    balanceAfter: account.balance,
    date: new Date().toISOString(),
    status: 'SUCCESS'
  };

  db.transactions.push(transaction);

  return res.status(200).json({
    success: true,
    message: `Retrait de ${parsedAmount} effectué avec succès`,
    data: {
      transaction,
      newBalance: account.balance
    }
  });
};

/**
 * FONCTION 5 - Transfert inter-bancaire
 */
const transfer = (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  if (!fromAccountId || !toAccountId || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'fromAccountId, toAccountId et amount sont obligatoires'
    });
  }

  if (fromAccountId === toAccountId) {
    return res.status(400).json({
      success: false,
      message: 'Les comptes source et destination doivent être différents'
    });
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Le montant doit être un nombre positif supérieur à 0'
    });
  }

  const fromAccount = db.accounts[fromAccountId];
  if (!fromAccount) {
    return res.status(404).json({
      success: false,
      message: `Compte source ${fromAccountId} introuvable`
    });
  }

  const toAccount = db.accounts[toAccountId];
  if (!toAccount) {
    return res.status(404).json({
      success: false,
      message: `Compte destination ${toAccountId} introuvable`
    });
  }

  if (fromAccount.balance < parsedAmount) {
    return res.status(400).json({
      success: false,
      message: `Solde insuffisant. Solde actuel: ${fromAccount.balance}`
    });
  }

  // Détecter si c'est inter-bancaire
  const isInterBank = fromAccount.bankId !== toAccount.bankId;

  fromAccount.balance -= parsedAmount;
  toAccount.balance += parsedAmount;

  const transaction = {
    id: uuidv4(),
    type: isInterBank ? 'TRANSFERT_INTER_BANCAIRE' : 'TRANSFERT',
    fromAccountId,
    toAccountId,
    fromBank: fromAccount.bankName,
    toBank: toAccount.bankName,
    amount: parsedAmount,
    date: new Date().toISOString(),
    status: 'SUCCESS'
  };

  db.transactions.push(transaction);

  return res.status(200).json({
    success: true,
    message: `Transfert de ${parsedAmount} effectué avec succès${isInterBank ? ' (inter-bancaire)' : ''}`,
    data: {
      transaction,
      fromAccountNewBalance: fromAccount.balance,
      toAccountNewBalance: toAccount.balance
    }
  });
};

/**
 * Lister les transactions d'un compte
 */
const getTransactions = (req, res) => {
  const { accountId } = req.params;

  if (!db.accounts[accountId]) {
    return res.status(404).json({
      success: false,
      message: `Compte ${accountId} introuvable`
    });
  }

  const transactions = db.transactions.filter(
    t => t.fromAccountId === accountId || t.toAccountId === accountId
  );

  return res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
};

module.exports = { deposit, withdraw, transfer, getTransactions };
