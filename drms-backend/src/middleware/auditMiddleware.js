const AuditLog = require('../models/AuditLog');

const logAction = async (user, action, resource = '', details = '', ipAddress = '') => {
  try {
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      action,
      resource,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAction;
