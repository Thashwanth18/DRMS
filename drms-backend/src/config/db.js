const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('querySrv')) {
      console.error('SRV DNS lookup failed. If this network blocks SRV records, use the non-SRV Atlas connection string in MONGO_URI.');
    }
    throw err;
  }
};

module.exports = connectDB;
