const mongoose = require('mongoose');
const People = require('./People');
// const Folder = require('./folderUpload');

const storageFileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'People', // Reference to the People model
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  folderPath: {
    type: String,
    ref: 'Folder',
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  originalFileId: {
    type: mongoose.Schema.Types.ObjectId, // Used for copy/duplicate to track the original file
    ref: 'FileUpload',
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'People', // Users who have access
    },
  ],
  shareLink: {
    type: String,
    unique: true, // Unique shareable link
    sparse: true,
  },
  permissions: {
    type: String,
    enum: ['read', 'edit'],
    default: 'read',
  },
});

const StorageFile = mongoose.model('StorageFile', storageFileSchema);
module.exports = StorageFile;
