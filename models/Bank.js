const mongoose = require("mongoose");

/**
 * @model Bank
 * Represents a financial institution in the multi-bank system.
 */
const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la banque est obligatoire"],
      trim: true,
      unique: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    code: {
      type: String,
      required: [true, "Le code banque est obligatoire"],
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: [10, "Le code ne peut pas dépasser 10 caractères"],
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual : nombre de comptes liés à cette banque
bankSchema.virtual("accounts", {
  ref: "Account",
  localField: "_id",
  foreignField: "bankId",
  count: true,
});

module.exports = mongoose.model("Bank", bankSchema);
