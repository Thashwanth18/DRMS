require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const adminUser = {
  name: 'Admin',
  username: 'admin',
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'Admin'
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({
      $or: [
        { email: adminUser.email.toLowerCase() },
        { username: adminUser.username.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    const user = await User.create(adminUser);
    console.log(`Created admin: ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Create admin error:', err.message);
    process.exit(1);
  }
};

createAdmin();
