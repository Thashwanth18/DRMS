const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('querySrv')) {
      console.error('SRV DNS lookup failed. If this network blocks SRV records, use the non-SRV Atlas connection string in MONGO_URI.');
    }
  }
};

module.exports = connectDB;
