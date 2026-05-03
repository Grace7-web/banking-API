const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🏦 Banking API - Système Multi-Banque",
      version: "1.0.0",
      description:
        "API RESTful pour la gestion d'un système bancaire multi-banque. " +
        "Permet la création de banques, la gestion de comptes et les transactions financières.",
      contact: {
        name: "Banking API Support",
        email: "support@bankingapi.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Serveur de développement",
      },
      {
        url: "https://banking-api.onrender.com/api/v1",
        description: "Serveur de production (Render)",
      },
    ],
    components: {
      schemas: {
        Bank: {
          type: "object",
          required: ["name", "code"],
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name: { type: "string", example: "Banque Nationale" },
            code: { type: "string", example: "BN001" },
            address: { type: "string", example: "123 Rue du Commerce, Paris" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Account: {
          type: "object",
          required: ["ownerName", "bankId"],
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
            accountNumber: { type: "string", example: "ACC-1234567890" },
            ownerName: { type: "string", example: "Jean Dupont" },
            bankId: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            balance: { type: "number", example: 1500.5 },
            currency: { type: "string", example: "EUR" },
            status: {
              type: "string",
              enum: ["active", "suspended", "closed"],
              example: "active",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            _id: { type: "string" },
            accountId: { type: "string" },
            type: { type: "string", enum: ["deposit", "withdrawal"] },
            amount: { type: "number", example: 500 },
            balanceBefore: { type: "number", example: 1000 },
            balanceAfter: { type: "number", example: 1500 },
            description: { type: "string", example: "Dépôt en espèces" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Ressource non trouvée" },
            errors: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
