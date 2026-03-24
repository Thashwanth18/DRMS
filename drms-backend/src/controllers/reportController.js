const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

exports.uploadSummary = async (req, res) => {
  try {
    const summary = await Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, totalSize: { $sum: '$fileSize' } } },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.userActivity = async (req, res) => {
  try {
    const activity = await AuditLog.aggregate([
      { $group: { _id: { user: '$userName', action: '$action' }, count: { $sum: 1 } } },
      { $group: { _id: '$_id.user', actions: { $push: { action: '$_id.action', count: '$count' } }, total: { $sum: '$count' } } },
      { $sort: { total: -1 } }
    ]);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.departmentReport = async (req, res) => {
  try {
    const report = await Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 }, totalSize: { $sum: '$fileSize' }, latestRecordDate: { $max: '$recordDate' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.accessLogReport = async (req, res) => {
  try {
    const report = await AuditLog.aggregate([
      { $match: { action: { $in: ['VIEW', 'DOWNLOAD', 'LOGIN', 'LOGOUT'] } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          latestActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
