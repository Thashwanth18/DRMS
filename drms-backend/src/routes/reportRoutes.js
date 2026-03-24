const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSummary, userActivity, departmentReport, accessLogReport } = require('../controllers/reportController');

router.get('/upload-summary', protect, authorize('Admin', 'Auditor'), uploadSummary);
router.get('/user-activity', protect, authorize('Admin', 'Auditor'), userActivity);
router.get('/department', protect, authorize('Admin', 'Auditor'), departmentReport);
router.get('/access-log', protect, authorize('Admin', 'Auditor'), accessLogReport);

module.exports = router;
