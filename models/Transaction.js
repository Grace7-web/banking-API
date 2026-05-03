const mongoose = require("mongoose");

/**
 * @model Transaction
 * Records every deposit or withdrawal operation on an account.
 */
const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "L'identifiant du compte est obligatoire"],
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: [true, "Le type de transaction est obligatoire"],
    },
    amount: {
      type: Number,
      required: [true, "Le montant est obligatoire"],
      min: [0.01, "Le montant doit être supérieur à 0"],
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [255, "La description ne peut pas dépasser 255 caractères"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
