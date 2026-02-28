/**
 * نظام قراءة وكتابة إعدادات الحماية مباشرة بدون كاش
 * يحل مشكلة st.db الكاش بين index.js وملفات الأوامر
 */

const fs = require('fs');
const path = require('path');

// مسار ملف الإعدادات بجانب index.js مباشرة
const CONFIG_PATH = path.join(__dirname, 'protect-data.json');

function readAll() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('[PROTECT-CONFIG] Read error:', e.message);
    return {};
  }
}

function writeAll(data) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[PROTECT-CONFIG] Write error:', e.message);
  }
}

module.exports = {
  get(key) {
    return readAll()[key];
  },
  set(key, value) {
    const data = readAll();
    data[key] = value;
    writeAll(data);
  },
  has(key) {
    return readAll()[key] !== undefined;
  },
  delete(key) {
    const data = readAll();
    delete data[key];
    writeAll(data);
  }
};
