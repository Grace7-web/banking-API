// src/routes/accountRoutes.js

const express = require('express');
const router = express.Router();
const { param } = require("express-validator");
const accountController = require('../controllers/accountController');
const validate = require("../middlewares/validate");

// Règle de validation pour l'ID
const idParamRule = [
  param("id").isMongoId().withMessage("ID invalide")
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
 *     summary: Lister tous les comptes (ou filtrer par banque)
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
router.get('/', listAccounts);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Obtenir un compte par ID
 *     tags: [Comptes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du compte
 *       404:
 *         description: Compte introuvable
 */
router.delete("/:id", idParamRule, validate, accountController.deleteAccount);
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
router.get("/:id/balance", idParamRule, validate, accountController.checkBalance);

module.exports = router;
