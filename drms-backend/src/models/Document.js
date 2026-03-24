const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  fileType: { type: String },
  originalName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  department: { type: String, required: true, trim: true },
  recordDate: { type: Date, required: true },
  tags: [{ type: String }],
  currentVersion: { type: Number, default: 1 },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  fileType: { type: String },
  originalName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  versions: [versionSchema],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

documentSchema.index({ title: 'text', tags: 'text', department: 'text', originalName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
