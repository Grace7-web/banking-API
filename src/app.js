// src/app.js
// Point d'entrée principal de l'API Bancaire

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const bankRoutes = require('./routes/bankRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globaux ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Documentation Swagger ────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Bancaire - Documentation',
  customCss: '.swagger-ui .topbar { background-color: #1a3c5e; }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// ─── Route d'accueil ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Bancaire Multi-Banque',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      banks: '/api/banks',
      accounts: '/api/accounts',
      transactions: {
        deposit: 'POST /api/transactions/deposit',
        withdraw: 'POST /api/transactions/withdraw',
        transfer: 'POST /api/transactions/transfer',
        history: 'GET /api/transactions/account/:accountId'
      }
    }
  });
});

// ─── Routes principales ───────────────────────────────────────────
app.use('/api/banks', bankRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// ─── Gestion des erreurs ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage du serveur ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs`);
  console.log(`🌐 API disponible sur   : http://localhost:${PORT}/api`);
});

module.exports = app;
