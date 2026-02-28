// =============================================
// ====== مدير قواعد البيانات المركزي ==========
// ====== يحل مشكلة عدم الحفظ والتزامن ========
// =============================================
const fs = require('fs');
const path = require('path');

// قراءة وكتابة JSON مباشرة بدون cache مشاكل
class SimpleDB {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    // إنشاء الملف لو مش موجود
    if (!fs.existsSync(this.filePath)) {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, '{}', 'utf8');
    }
  }

  _read() {
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch { return {}; }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  get(key) {
    return this._read()[key] ?? null;
  }

  set(key, value) {
    const data = this._read();
    data[key] = value;
    this._write(data);
    return value;
  }

  delete(key) {
    const data = this._read();
    delete data[key];
    this._write(data);
  }

  has(key) {
    return this._read()[key] !== undefined;
  }

  push(key, value) {
    const data = this._read();
    if (!Array.isArray(data[key])) data[key] = [];
    data[key].push(value);
    this._write(data);
    return data[key];
  }

  all() {
    return this._read();
  }
}

// كل الـ databases في مكان واحد
const databases = {
  protectDB:    new SimpleDB('./Json-db/Bots/protectDB.json'),
  logsDB:       new SimpleDB('./Json-db/Bots/logsDB.json'),
  systemDB:     new SimpleDB('./Json-db/Bots/systemDB.json'),
  taxDB:        new SimpleDB('./Json-db/Bots/taxDB.json'),
  suggestionsDB: new SimpleDB('./Json-db/Bots/suggestionsDB.json'),
  feedbackDB:   new SimpleDB('./Json-db/Bots/feedbackDB.json'),
  azkarDB:      new SimpleDB('./Json-db/Bots/azkarDB.json'),
  ticketDB:     new SimpleDB('./Json-db/Bots/ticketDB.json'),
  tokenDB:      new SimpleDB('./Json-db/Bots/tokenDB.json'),
  one4allDB:    new SimpleDB('./Json-db/Bots/one4allDB.json'),
  prefixDB:     new SimpleDB('./Json-db/prefix.json'),
  premiumDB:    new SimpleDB('./Json-db/Bots/creditDB.json'),
  aiDB:         new SimpleDB('./Json-db/Bots/aiDB.json'),
  levelDB:      new SimpleDB('./Json-db/Bots/levelDB.json'),
  autolineDB:   new SimpleDB('./Json-db/Bots/autolineDB.json'),
  shortcutDB:   new SimpleDB('./Json-db/Others/shortcutDB.json'),
  nadekoDB:     new SimpleDB('./Json-db/Bots/nadekoDB.json'),
  autoEmojiDB:  new SimpleDB('./Json-db/Bots/autoEmojiDB.json'),
};

module.exports = databases;
module.exports.SimpleDB = SimpleDB;
