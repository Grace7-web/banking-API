const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * @model Account
 * Represents a bank account belonging to a bank.
 */
const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      unique: true,
      default: () => `ACC-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`,
    },
    ownerName: {
      type: String,
      required: [true, "Le nom du titulaire est obligatoire"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: [true, "L'identifiant de la banque est obligatoire"],
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Le solde ne peut pas être négatif"],
    },
    currency: {
      type: String,
      default: "XOF",
      enum: ["XOF", "EUR", "USD", "GBP"],
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);
