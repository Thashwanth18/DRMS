const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadDocument, getDocuments, getDocument,
  downloadDocument, uploadNewVersion, restoreVersion, deleteDocument, deleteVersion
} = require('../controllers/documentController');

router.get('/', protect, getDocuments);
router.post('/', protect, authorize('Admin', 'Record Manager'), upload.single('file'), uploadDocument);
router.get('/:id', protect, getDocument);
router.get('/:id/download', protect, downloadDocument);
router.post('/:id/version', protect, authorize('Admin', 'Record Manager'), upload.single('file'), uploadNewVersion);
router.put('/:id/restore', protect, authorize('Admin', 'Record Manager'), restoreVersion);
router.delete('/:id/version/:versionNumber', protect, authorize('Admin', 'Record Manager'), deleteVersion);
router.delete('/:id', protect, authorize('Admin', 'Record Manager'), deleteDocument);

module.exports = router;
