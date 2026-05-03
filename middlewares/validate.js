const { validationResult } = require("express-validator");

/**
 * @middleware validate
 * Intercepts express-validator errors before reaching the controller.
 * Returns 422 with a list of validation messages if any field is invalid.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Erreur de validation",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
