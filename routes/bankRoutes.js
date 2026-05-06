// src/routes/bankRoutes.js

const express = require('express');
const router = express.Router();
const { createBank, getAllBanks } = require('../controllers/bankController');

/**
 * @swagger
 * /api/banks:
 *   post:
 *     summary: Créer une nouvelle banque
 *     tags: [Banques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Banque Atlantique"
 *               code:
 *                 type: string
 *                 example: "BA"
 *     responses:
 *       201:
 *         description: Banque créée
 *       409:
 *         description: Code banque déjà utilisé
 */
router.post('/', createBank);

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Lister toutes les banques
 *     tags: [Banques]
 *     responses:
 *       200:
 *         description: Liste des banques
 */
router.get('/', getAllBanks);

module.exports = router;
