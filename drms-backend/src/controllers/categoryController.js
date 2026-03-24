const Category = require('../models/Category');
const Document = require('../models/Document');
const logAction = require('../middleware/auditMiddleware');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('createdBy', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (await Category.findOne({ name }))
      return res.status(400).json({ message: 'Category already exists' });
    const category = await Category.create({ name, description, createdBy: req.user._id });
    await logAction(req.user, 'CATEGORY_CREATE', category._id.toString(), `Created category: ${category.name}`, req.ip);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await logAction(req.user, 'CATEGORY_UPDATE', category._id.toString(), `Updated category: ${category.name}`, req.ip);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const linkedDocuments = await Document.countDocuments({ category: req.params.id, isDeleted: false });
    if (linkedDocuments > 0) {
      return res.status(400).json({ message: 'Category is in use by active documents' });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await logAction(req.user, 'CATEGORY_DELETE', category._id.toString(), `Deleted category: ${category.name}`, req.ip);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
