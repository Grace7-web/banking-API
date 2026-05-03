// src/config/swagger.js

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bancaire Multi-Banque',
      version: '1.0.0',
      description: `
## API de gestion bancaire multi-banque

### Fonctionnalités disponibles :
- **Banques** : Créer et lister les banques
- **Comptes** : Créer et lister les comptes par banque
- **Dépôt** : Créditer un compte
- **Retrait** : Débiter un compte (avec vérification de solde)
- **Transfert** : Virer entre comptes (même banque ou inter-bancaire)

### Banques pré-chargées :
- \`bank-001\` : Banque Centrale du Cameroun (BCC)
- \`bank-002\` : Afriland First Bank (AFB)
      `,
      contact: {
        name: 'Support API',
        email: 'support@banking-api.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Serveur principal'
      }
    ],
    tags: [
      { name: 'Banques', description: 'Gestion des banques' },
      { name: 'Comptes', description: 'Gestion des comptes bancaires' },
      { name: 'Transactions', description: 'Dépôt, Retrait, Transfert' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
