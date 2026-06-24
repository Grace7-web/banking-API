// src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const { depositFromBody, withdrawFromBody, getTransactionHistoryFromRoute, transfer } = require('../controllers/transactionController');

/**
 * @swagger
 * /api/transactions/deposit:
 *   post:
 *     summary: Faire un dépôt
 *     tags: [Transactions]
 */
router.post('/deposit', depositFromBody);

/**
 * @swagger
 * /api/transactions/withdraw:
 *   post:
 *     summary: Faire un retrait
 *     tags: [Transactions]
 */
router.post('/withdraw', withdrawFromBody);

/**
 * @swagger
 * /api/transactions/history/:accountId:
 *   get:
 *     summary: Obtenir l'historique des transactions
 *     tags: [Transactions]
 */
router.get('/history/:accountId', getTransactionHistoryFromRoute);

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Transfert entre comptes (même banque ou inter-bancaire
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
 *                 example: "uuid-compte-source
 *               toAccountId:
 *                 type: string
 *                 example: "uuid-compte-destination"
 *               amount:
 *                 type: number
 *                 example: 5000
 *               description:
 *                 type: string
 *                 example: "Remboursement prêt"
 *     responses:
 *       200:
 *         description: Transfert effectué
 *       400:
 *         description: Solde insuffisant, montant invalide ou comptes identiques
 *       404:
 *         description: Compte source ou destination introuvable
 */
router.post('/transfer', transfer);

module.exports = router;
