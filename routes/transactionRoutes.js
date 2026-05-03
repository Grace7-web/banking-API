// src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const {
  deposit,
  withdraw,
  transfer,
  getTransactions
} = require('../controllers/transactionController');

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Effectuer un dépôt sur un compte
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountId, amount]
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: "uuid-du-compte"
 *               amount:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Dépôt effectué
 *       400:
 *         description: Montant invalide ou données manquantes
 *       404:
 *         description: Compte introuvable
 */
router.post('/deposit', deposit);

/**
 * @swagger
 * /api/transactions/withdraw:
 *   post:
 *     summary: Effectuer un retrait sur un compte
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountId, amount]
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: "uuid-du-compte"
 *               amount:
 *                 type: number
 *                 example: 2000
 *     responses:
 *       200:
 *         description: Retrait effectué
 *       400:
 *         description: Solde insuffisant ou montant invalide
 *       404:
 *         description: Compte introuvable
 */
router.post('/withdraw', withdraw);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfert entre comptes (même banque ou inter-bancaire)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromAccountId, toAccountId, amount]
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 example: "uuid-compte-source"
 *               toAccountId:
 *                 type: string
 *                 example: "uuid-compte-destination"
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Transfert effectué
 *       400:
 *         description: Solde insuffisant, montant invalide ou comptes identiques
 *       404:
 *         description: Compte source ou destination introuvable
 */
router.post('/transfer', transfer);

/**
 * @swagger
 * /api/transactions/account/{accountId}:
 *   get:
 *     summary: Historique des transactions d'un compte
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des transactions
 *       404:
 *         description: Compte introuvable
 */
router.get('/account/:accountId', getTransactions);

module.exports = router;
