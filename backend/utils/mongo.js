const mongoose = require('mongoose');

function getMongoUris() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri =
    process.env.LOCAL_MONGODB_URI ||
    process.env.MONGODB_LOCAL_URI ||
    'mongodb://127.0.0.1:27017/cinema-booking-system';

  return [primaryUri, fallbackUri].filter(Boolean);
}

async function connectMongo() {
  const uris = getMongoUris();
  let lastError;

  for (const uri of uris) {
    try {
      await mongoose.connect(uri);
      return uri;
    } catch (error) {
      lastError = error;
    }
  }

  const message = lastError ? lastError.message : 'Unknown MongoDB connection error';
  throw new Error(
    `Unable to connect to MongoDB. Tried ${uris.length} URI(s). Last error: ${message}. ` +
      'If your Atlas SRV record is not reachable, set LOCAL_MONGODB_URI to a local MongoDB instance.'
  );
}

module.exports = {
  connectMongo,
  getMongoUris,
};