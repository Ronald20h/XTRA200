// =============================================
// ====== Shared Database - يستخدم SimpleDB ===
// ====== عشان الداشبورد والبوت يشتغلوا معاً ==
// =============================================
const { 
  protectDB, logsDB, taxDB, autolineDB, 
  suggestionsDB, feedbackDB, systemDB, shortcutDB,
  SimpleDB
} = require('./db-manager');

// BroadcastDB مخصص
const broadcastDB = new SimpleDB('./Json-db/Bots/BroadcastDB.json');

module.exports = {
  protectDB,
  logsDB,
  taxDB,
  autolineDB,
  suggestionsDB,
  feedbackDB,
  systemDB,
  shortcutDB,
  broadcastDB,
};
