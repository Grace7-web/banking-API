const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true, // Permet d'utiliser describe, it, expect sans les importer
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "controllers/**/*.js",
        "services/**/*.js",
        "middlewares/**/*.js"
      ],
      exclude: [
        "routes/**/*.js",
        "middlewares/validate.js"
      ],
      all: true,
      clean: false // Ne pas supprimer le dossier coverage avant les tests
    }
  },
});