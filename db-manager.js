const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL   || 'https://solid-dingo-10923.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'ASqrAAIncDJhOGUzODk5ZGRmODk0MzQ3YTg3OTE1ZTQ4MDA1YzIwY3AyMTA5MjM';

let _fetch;
try { _fetch = fetch; } catch { _fetch = require('node-fetch'); }

async function rGet(key) {
  try {
    const r = await _fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } });
    const d = await r.json();
    return d.result || null;
  } catch { return null; }
}

async function rSet(key, value) {
  try {
    await _fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
  } catch {}
}

class SimpleDB {
  constructor(name) {
    this.name  = name;
    this.rKey  = `xtrabot:${name}`;
    this.cache = {};
    rGet(this.rKey).then(val => {
      if (val) try { this.cache = JSON.parse(val); } catch {}
    }).catch(() => {});
  }
  _save() { rSet(this.rKey, JSON.stringify(this.cache)).catch(() => {}); }
  get(key)    { return this.cache[key] ?? null; }
  has(key)    { return this.cache[key] !== undefined; }
  all()       { return this.cache; }
  set(key, value) { this.cache[key] = value; this._save(); return value; }
  delete(key)     { delete this.cache[key]; this._save(); }
  push(key, value) {
    if (!Array.isArray(this.cache[key])) this.cache[key] = [];
    this.cache[key].push(value);
    this._save();
    return this.cache[key];
  }
}

const databases = {
  protectDB:     new SimpleDB('protectDB'),
  logsDB:        new SimpleDB('logsDB'),
  systemDB:      new SimpleDB('systemDB'),
  taxDB:         new SimpleDB('taxDB'),
  suggestionsDB: new SimpleDB('suggestionsDB'),
  feedbackDB:    new SimpleDB('feedbackDB'),
  azkarDB:       new SimpleDB('azkarDB'),
  ticketDB:      new SimpleDB('ticketDB'),
  tokenDB:       new SimpleDB('tokenDB'),
  one4allDB:     new SimpleDB('one4allDB'),
  prefixDB:      new SimpleDB('prefixDB'),
  premiumDB:     new SimpleDB('premiumDB'),
  aiDB:          new SimpleDB('aiDB'),
  levelDB:       new SimpleDB('levelDB'),
  autolineDB:    new SimpleDB('autolineDB'),
  shortcutDB:    new SimpleDB('shortcutDB'),
  nadekoDB:      new SimpleDB('nadekoDB'),
  autoEmojiDB:   new SimpleDB('autoEmojiDB'),
};

async function initDatabases() {
  console.log('✅ Databases ready!');
}

module.exports = databases;
module.exports.SimpleDB = SimpleDB;
module.exports.initDatabases = initDatabases;
