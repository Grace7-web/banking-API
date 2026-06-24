const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000, // Timeout global de 30s pour les tests d'intégration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "controllers/**/*.js",
        "services/**/*.js",
        "middlewares/**/*.js",
        "config/**/*.js"
      ],
      exclude: [
        "routes/**/*.js",
        "middlewares/validate.js",
        "config/swagger.js"
      ],
      all: true,
      clean: false
    }
  },
});