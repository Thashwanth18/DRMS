const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'UPLOAD', 'DELETE', 'DOWNLOAD', 'UPDATE', 'VIEW', 'RESTORE', 'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_DELETE', 'USER_UPDATE'],
    required: true
  },
  resource: { type: String, default: '' },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
