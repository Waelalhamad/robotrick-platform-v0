const mongoose = require("mongoose");

const projectPartSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
    },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for filtering projects by owner
    },
    parts: { type: [projectPartSchema], default: [] },
  },
  { timestamps: true }
);

// Compound index for user's projects ordered by creation date
projectSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
