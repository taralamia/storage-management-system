const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "People",
    required: true,
  },
  folderName: {
    type: String,
    required: true,
  },
  folderPath: {
    type: String,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
    },
  ],
  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  permissions: {
    type: String,
    enum: ["read", "edit"],
    default: "read",
  },
});

module.exports = mongoose.model("Folder", folderSchema);
