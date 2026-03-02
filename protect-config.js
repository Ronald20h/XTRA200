/**
 * protect-config - الآن يستخدم db-manager المركزي
 * يحل تعارض البيانات بين index.js والداشبورد وأوامر الحماية
 */
const { protectDB } = require('./db-manager');
module.exports = protectDB;
