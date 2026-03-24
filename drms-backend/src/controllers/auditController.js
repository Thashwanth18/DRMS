const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId, search } = req.query;
    const query = {};
    if (action) query.action = action;
    if (userId) query.user = userId;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
