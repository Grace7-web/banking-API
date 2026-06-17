/**
 * @middleware errorHandler
 * Global error handling middleware.
 * Catches all unhandled errors and returns a structured JSON response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
