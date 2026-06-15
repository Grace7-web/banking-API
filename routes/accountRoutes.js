// src/routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const { param } = require("express-validator");
const { createAccount, getAllAccounts, deleteAccount, checkBalance } = require('../controllers/accountController');
const { deposit, withdrawal, getTransactionHistory } = require('../controllers/transactionController');
const validate = require("../middlewares/validate");

// Règle de validation pour l'ID (Utilisation de isUUID car PostgreSQL génère des UUID)
const idParamRule = [
  param("id").isUUID(4).withMessage("ID invalide (doit être un UUID v4)")
];

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Créer un nouveau compte bancaire
 *     tags: [Comptes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankId, owner]
 *             properties:
 *               bankId:
 *                 type: string
 *                 example: "bank-001"
 *               owner:
 *                 type: string
 *                 example: "Jean Dupont"
 *               initialBalance:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Banque introuvable
 */
router.post('/', createAccount);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Lister tous les comptes
 *     tags: [Comptes]
 *     parameters:
 *       - in: query
 *         name: bankId
 *         schema:
 *           type: string
 *         description: Filtrer par ID de banque
 *     responses:
 *       200:
 *         description: Liste des comptes
 */
router.get('/', getAllAccounts);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Supprimer un compte par ID
 *     tags: [Comptes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compte supprimé
 *       404:
 *         description: Compte introuvable
 */
router.delete("/:id", idParamRule, validate, deleteAccount);

/**
 * @swagger
 * /api/accounts/{id}/balance:
 *   get:
 *     summary: Vérifier le solde d'un compte
 *     tags: [Comptes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solde du compte
 *       404:
 *         description: Compte introuvable
 */
router.get("/:id/balance", idParamRule, validate, checkBalance);

/**
 * @swagger
 * /api/accounts/{id}/deposit:
 *   post:
 *     summary: Faire un dépôt
 *     tags: [Comptes]
 */
router.post("/:id/deposit", idParamRule, validate, deposit);

/**
 * @swagger
 * /api/accounts/{id}/withdrawal:
 *   post:
 *     summary: Faire un retrait
 *     tags: [Comptes]
 */
router.post("/:id/withdrawal", idParamRule, validate, withdrawal);

/**
 * @swagger
 * /api/accounts/{id}/transactions:
 *   get:
 *     summary: Obtenir l'historique des transactions
 *     tags: [Comptes]
 */
router.get("/:id/transactions", idParamRule, validate, getTransactionHistory);

module.exports = router;
