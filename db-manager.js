// =============================================
// ====== مدير قواعد البيانات - Upstash Redis ==
// ====== بيانات دائمة لا تتمسح أبداً =========
// =============================================

const REDIS_URL  = process.env.UPSTASH_REDIS_REST_URL  || 'https://solid-dingo-10923.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'ASqrAAIncDJhOGUzODk5ZGRmODk0MzQ3YTg3OTE1ZTQ4MDA1YzIwY3AyMTA5MjM';

let fetchFn;
try { fetchFn = global.fetch || require('node-fetch'); } catch { fetchFn = require('node-fetch'); }

async function redisGet(key) {
  try {
    const res = await fetchFn(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
    const data = await res.json();
    return data.result || null;
  } catch { return null; }
}

async function redisSet(key, value) {
  try {
    await fetchFn(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
  } catch {}
}

async function redisDel(key) {
  try {
    await fetchFn(`${REDIS_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    });
  } catch {}
}

class SimpleDB {
  constructor(name) {
    this.name   = name;
    this.rKey   = `xtrabot:db:${name}`;
    this.cache  = {};
    this.ready  = false;
    this._load();
  }

  async _load() {
    try {
      const val = await redisGet(this.rKey);
      if (val) this.cache = JSON.parse(val);
    } catch {}
    this.ready = true;
  }

  _save() {
    redisSet(this.rKey, JSON.stringify(this.cache)).catch(() => {});
  }

  get(key)        { return this.cache[key] ?? null; }
  has(key)        { return this.cache[key] !== undefined; }
  all()           { return this.cache; }

  set(key, value) {
    this.cache[key] = value;
    this._save();
    return value;
  }

  delete(key) {
    delete this.cache[key];
    this._save();
  }

  push(key, value) {
    if (!Array.isArray(this.cache[key])) this.cache[key] = [];
    this.cache[key].push(value);
    this._save();
    return this.cache[key];
  }
}

// دالة تنتظر تحميل كل البيانات من Redis قبل تشغيل البوت
async function initDatabases() {
  console.log('📦 Loading data from Redis...');
  await Promise.all(Object.values(databases).map(db => 
    new Promise(resolve => {
      const check = () => db.ready ? resolve() : setTimeout(check, 50);
      check();
    })
  ));
  console.log('✅ All databases loaded from Redis!');
}

const databases = {
  protectDB:    new SimpleDB('protectDB'),
  logsDB:       new SimpleDB('logsDB'),
  systemDB:     new SimpleDB('systemDB'),
  taxDB:        new SimpleDB('taxDB'),
  suggestionsDB: new SimpleDB('suggestionsDB'),
  feedbackDB:   new SimpleDB('feedbackDB'),
  azkarDB:      new SimpleDB('azkarDB'),
  ticketDB:     new SimpleDB('ticketDB'),
  tokenDB:      new SimpleDB('tokenDB'),
  one4allDB:    new SimpleDB('one4allDB'),
  prefixDB:     new SimpleDB('prefixDB'),
  premiumDB:    new SimpleDB('premiumDB'),
  aiDB:         new SimpleDB('aiDB'),
  levelDB:      new SimpleDB('levelDB'),
  autolineDB:   new SimpleDB('autolineDB'),
  shortcutDB:   new SimpleDB('shortcutDB'),
  nadekoDB:     new SimpleDB('nadekoDB'),
  autoEmojiDB:  new SimpleDB('autoEmojiDB'),
};

module.exports = databases;
module.exports.SimpleDB = SimpleDB;
module.exports.initDatabases = initDatabases;
