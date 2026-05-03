require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

/**
 * Starts the server:
 * 1. Connect to MongoDB
 * 2. Listen on configured port
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log("─────────────────────────────────────────────");
    console.log(`🏦  Banking API démarrée sur le port ${PORT}`);
    console.log(`📖  Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`💚  Health check:  http://localhost:${PORT}/health`);
    console.log(`🌍  Environnement: ${process.env.NODE_ENV || "development"}`);
    console.log("─────────────────────────────────────────────");
  });
};

startServer().catch((err) => {
  console.error("❌ Impossible de démarrer le serveur :", err.message);
  process.exit(1);
});
