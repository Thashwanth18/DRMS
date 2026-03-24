const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Category = require('../models/Category');
const logAction = require('../middleware/auditMiddleware');

const sanitizeTags = (tags = '') =>
  Array.from(new Set(
    String(tags)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  ));

const buildDocumentResponse = (doc) => {
  const data = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...data,
    previewUrl: `/uploads/${data.filePath}`
  };
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, category, department, tags, notes, recordDate } = req.body;
    if (!title || !department || !recordDate) {
      return res.status(400).json({ message: 'Title, department, and record date are required' });
    }
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(400).json({ message: 'Selected category does not exist' });
    }
    const filePath = req.file.filename;
    const doc = await Document.create({
      title,
      category: category || undefined,
      department,
      recordDate,
      tags: sanitizeTags(tags),
      filePath,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      originalName: req.file.originalname,
      uploadedBy: req.user._id,
      currentVersion: 1,
      versions: [{
        versionNumber: 1,
        filePath,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        originalName: req.file.originalname,
        uploadedBy: req.user._id,
        notes: notes || ''
      }]
    });
    await logAction(req.user, 'UPLOAD', doc._id.toString(), `Uploaded: ${title}`, req.ip);
    const populated = await Document.findById(doc._id).populate('category', 'name').populate('uploadedBy', 'name');
    res.status(201).json(buildDocumentResponse(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { search, category, department, startDate, endDate, tag, fileType, page = 1, limit = 10 } = req.query;
    const query = { isDeleted: false };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (tag) query.tags = { $in: [tag] };
    if (fileType) query.fileType = fileType.startsWith('.') ? fileType.toLowerCase() : `.${fileType.toLowerCase()}`;
    if (startDate || endDate) {
      query.recordDate = {};
      if (startDate) query.recordDate.$gte = new Date(startDate);
      if (endDate) query.recordDate.$lte = new Date(endDate);
    }
    const total = await Document.countDocuments(query);
    const docs = await Document.find(query)
      .populate('category', 'name')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ docs: docs.map(buildDocumentResponse), total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('category', 'name')
      .populate('uploadedBy', 'name')
      .populate('versions.uploadedBy', 'name');
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });
    await logAction(req.user, 'VIEW', doc._id.toString(), `Viewed: ${doc.title}`, req.ip);
    res.json(buildDocumentResponse(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });
    const filePath = path.join(__dirname, '../../uploads', doc.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on server' });
    await logAction(req.user, 'DOWNLOAD', doc._id.toString(), `Downloaded: ${doc.title}`, req.ip);
    res.download(filePath, doc.originalName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadNewVersion = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const doc = await Document.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: 'Document not found' });
    const newVersion = doc.currentVersion + 1;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    doc.versions.push({
      versionNumber: newVersion,
      filePath: req.file.filename,
      fileSize: req.file.size,
      fileType,
      originalName: req.file.originalname,
      uploadedBy: req.user._id,
      notes: req.body.notes || ''
    });
    doc.currentVersion = newVersion;
    doc.filePath = req.file.filename;
    doc.fileSize = req.file.size;
    doc.fileType = fileType;
    doc.originalName = req.file.originalname;
    await doc.save();
    await logAction(req.user, 'UPDATE', doc._id.toString(), `New version ${newVersion} uploaded`, req.ip);
    const populated = await Document.findById(doc._id)
      .populate('category', 'name')
      .populate('uploadedBy', 'name')
      .populate('versions.uploadedBy', 'name');
    res.json(buildDocumentResponse(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreVersion = async (req, res) => {
  try {
    const { versionNumber } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const version = doc.versions.find(v => v.versionNumber === Number(versionNumber));
    if (!version) return res.status(404).json({ message: 'Version not found' });
    doc.filePath = version.filePath;
    doc.fileSize = version.fileSize;
    doc.fileType = version.fileType;
    doc.originalName = version.originalName;
    doc.currentVersion = version.versionNumber;
    await doc.save();
    await logAction(req.user, 'RESTORE', doc._id.toString(), `Restored to version ${versionNumber}`, req.ip);
    const populated = await Document.findById(doc._id)
      .populate('category', 'name')
      .populate('uploadedBy', 'name')
      .populate('versions.uploadedBy', 'name');
    res.json({ message: `Restored to version ${versionNumber}`, doc: buildDocumentResponse(populated) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVersion = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const versionNumber = Number(req.params.versionNumber);
    if (doc.versions.length === 1) return res.status(400).json({ message: 'Cannot delete the only version' });
    if (doc.currentVersion === versionNumber) return res.status(400).json({ message: 'Cannot delete the current active version' });
    doc.versions = doc.versions.filter((v) => v.versionNumber !== versionNumber);
    await doc.save();
    await logAction(req.user, 'DELETE', doc._id.toString(), `Deleted version ${versionNumber}`, req.ip);
    const populated = await Document.findById(doc._id)
      .populate('category', 'name')
      .populate('uploadedBy', 'name')
      .populate('versions.uploadedBy', 'name');
    res.json(buildDocumentResponse(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.isDeleted = true;
    await doc.save();
    await logAction(req.user, 'DELETE', doc._id.toString(), `Deleted: ${doc.title}`, req.ip);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
