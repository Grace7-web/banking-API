// src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.stack);

  const status = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable`
  });
};

module.exports = { errorHandler, notFound };
