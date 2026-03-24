require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true },
  password: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const users = [
  { name: 'Admin User', username: 'admin', email: 'admin@drms.com', password: 'Admin@123', role: 'Admin' },
  { name: 'Record Manager', username: 'manager', email: 'manager@drms.com', password: 'Manager@123', role: 'Record Manager' },
  { name: 'John Doe', username: 'john', email: 'john@drms.com', password: 'User@123', role: 'Authorized User' },
  { name: 'Gowsik', username: 'gowsik', email: 'gowsik@drms.com', password: 'Gowsik@123', role: 'Authorized User' },
  { name: 'Auditor', username: 'auditor', email: 'auditor@drms.com', password: 'Auditor@123', role: 'Auditor' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`Already exists: ${u.email}`);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed });
      console.log(`Created: ${u.email} | Role: ${u.role}`);
    }

    console.log('\nAccounts ready');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    if (err.message.includes('querySrv')) {
      console.error('SRV DNS lookup failed. If this network blocks SRV records, use the non-SRV Atlas connection string in MONGO_URI.');
    }
    process.exit(1);
  }
};

seed();
