const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getLogs } = require('../controllers/auditController');

router.get('/', protect, authorize('Admin', 'Auditor'), getLogs);

module.exports = router;
