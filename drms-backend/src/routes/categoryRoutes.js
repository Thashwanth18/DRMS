const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', protect, getCategories);
router.post('/', protect, authorize('Admin', 'Record Manager'), createCategory);
router.put('/:id', protect, authorize('Admin', 'Record Manager'), updateCategory);
router.delete('/:id', protect, authorize('Admin'), deleteCategory);

module.exports = router;
