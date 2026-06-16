




const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const bankRoutes = require("./routes/bankRoutes");
const accountRoutes = require("./routes/accountRoutes");
const errorHandler = require("./middlewares/errorHandler");
const path = require("path");

const app = express();

// ─── Global Middlewares ───────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ─── API Documentation ────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "🏦 Banking API Docs",
    customCss: `
      .swagger-ui .topbar { background-color: #1a3a5c; }
      .swagger-ui .topbar-wrapper img { content: url(''); }
    `,
  })
);

// JSON spec endpoint (useful for external tools)
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const transactionRoutes = require("./routes/transactionRoutes");

// ─── API Routes ───────────────────────────────────────────────
app.use("/api/v1/banks", bankRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🏦 Banking API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
// ─── Serve Frontend (Racine) ──────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' non trouvée`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
