/**
 * @middleware errorHandler
 * Global error handling middleware.
 * Catches all unhandled errors and returns a structured JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Erreur interne du serveur";

  // Mongoose: ID invalide (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `ID invalide : ${err.value}`;
  }

  // Mongoose: valeur en double (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur '${err.keyValue[field]}' existe déjà pour le champ '${field}'`;
  }

  // Mongoose: erreurs de validation
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
