const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logAction = require('../middleware/auditMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '8h' });

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role
});

exports.register = async (req, res) => {
  try {
    const isBootstrapping = (await User.countDocuments()) === 0;
    const { name, username, email, password, role } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (username && await User.findOne({ username: username.toLowerCase() })) {
      return res.status(400).json({ message: 'Username already registered' });
    }

    const requestedRole = req.user?.role === 'Admin' ? role : undefined;
    const assignedRole = isBootstrapping ? (role || 'Admin') : (requestedRole || 'Authorized User');
    const user = await User.create({ name, username, email, password, role: assignedRole });

    res.status(201).json({ token: generateToken(user._id), user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const lookup = String(identifier || email || '').toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { username: lookup }
      ]
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await logAction(user, 'LOGIN', 'Auth', 'User logged in', req.ip);
    res.json({ token: generateToken(user._id), user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  await logAction(req.user, 'LOGOUT', 'Auth', 'User logged out', req.ip);
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete your own account' });
    await user.deleteOne();
    await logAction(req.user, 'USER_DELETE', user._id.toString(), `Deleted user ${user.email}`, req.ip);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role, username } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (role) user.role = role;
    if (username) user.username = username.toLowerCase();

    await user.save();
    await logAction(req.user, 'USER_UPDATE', user._id.toString(), `Updated user ${user.email}`, req.ip);

    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
