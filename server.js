
const app = require("./app");
const prisma = require("./config/db");
const { execSync } = require("child_process");

const PORT = process.env.PORT || 3000;

/**
 * Starts the server:
 * 1. Run Prisma migrations
 * 2. Connect to PostgreSQL via Prisma
 * 3. Listen on configured port
 */
const startServer = async () => {
  try {
    // Sync database schema in production (more forgiving than migrate deploy)
    if (process.env.NODE_ENV === "production") {
      console.log("🔄 Syncing database schema...");
      try {
        execSync("npx prisma db push", { stdio: "inherit" });
        console.log("✅ Database schema synced");
      } catch (err) {
        console.warn("⚠️ Database sync failed, continuing anyway:", err.message);
      }
    }
    
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected via Prisma");

    // Initialisation des banques par défaut (CCA et Afriland)
    const defaultBanks = [
      { name: "Crédit Communautaire d'Afrique", code: "CCA" },
      { name: "Afriland First Bank", code: "AFRILAND" }
    ];

    try {
      for (const bank of defaultBanks) {
        const existingBank = await prisma.bank.findFirst({
          where: {
            OR: [
              { code: bank.code },
              { name: bank.name }
            ]
          }
        });
        
        if (!existingBank) {
          await prisma.bank.create({
            data: bank
          });
          console.log(`🏦 Banque ${bank.name} (${bank.code}) ajoutée par défaut.`);
        }
      }
    } catch (err) {
      console.error("⚠️ Erreur lors de l'initialisation des banques:", err.message);
    }

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────────");
      console.log(`🏦  Banking API démarrée sur le port ${PORT}`);
      console.log(`📖  Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`💚  Health check:  http://localhost:${PORT}/health`);
      console.log(`🌍  Environnement: ${process.env.NODE_ENV || "development"}`);
      console.log("─────────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ Erreur lors du démarrage du serveur:", err);
    throw err;
  }
};

startServer().catch((err) => {
  console.error("❌ Impossible de démarrer le serveur :", err.message);
  process.exit(1);
});
