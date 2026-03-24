require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  { name: 'Admin', username: 'admin', email: 'admin@drms.com', password: 'Admin@123', role: 'Admin' },
  { name: 'Manager', username: 'manager', email: 'manager@drms.com', password: 'Manager@123', role: 'Record Manager' },
  { name: 'User', username: 'tk', email: 'tk@drms.com', password: 'User@123', role: 'Authorized User' },
  { name: 'User', username: 'gowsik', email: 'gowsik@drms.com', password: 'Gowsik@123', role: 'Authorized User' },
  { name: 'Auditor', username: 'auditor', email: 'auditor@drms.com', password: 'Auditor@123', role: 'Auditor' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    for (const account of users) {
      const email = account.email.toLowerCase();
      const username = account.username.toLowerCase();

      let user = await User.findOne({
        $or: [
          { email },
          { username }
        ]
      });

      if (!user) {
        user = new User({
          name: account.name,
          username,
          email,
          password: account.password,
          role: account.role
        });

        await user.save();
        console.log(`Created: ${email} | Role: ${account.role}`);
        continue;
      }

      user.name = account.name;
      user.username = username;
      user.email = email;
      user.password = account.password;
      user.role = account.role;

      await user.save();
      console.log(`Updated: ${email} | Role: ${account.role}`);
    }

    console.log('\nAccounts are ready for login.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
