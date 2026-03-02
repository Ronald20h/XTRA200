// ============================================
// ====== DASHBOARD SERVER - one4all bot ======
// ============================================

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config');

// ✅ استخدام db-manager المركزي - يحل مشكلة عدم الحفظ
const {
  systemDB, protectDB, logsDB, taxDB, autolineDB,
  suggestionsDB, feedbackDB, ticketDB, azkarDB,
  tokenDB, prefixDB, premiumDB, one4allDB, aiDB, shortcutDB
} = require('./db-manager');

let botClient = null;

function startDashboard(client) {
  botClient = client;
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.set('view cache', false);

  app.use(session({
    secret: config.sessionSecret || 'xtrabot_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new DiscordStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'guilds']
  }, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
  }));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/auth/discord');
  }

  function isOwnerMW(req, res, next) {
    if (req.isAuthenticated() && config.owners.includes(req.user.id)) return next();
    return res.status(403).send('<h1>403 - غير مصرح لك</h1><a href="/dashboard">رجوع</a>');
  }

  function isPremium(guildId) {
    try {
      const expiry = premiumDB.get(`premium_${guildId}`);
      if (!expiry) return false;
      return Date.now() < expiry;
    } catch { return false; }
  }

  function checkOwner(userId) {
    return config.owners.includes(userId);
  }

  function getBotStats() {
    if (!botClient) return { guilds: 0, users: 0, ping: 0, uptime: 0 };
    return {
      guilds: botClient.guilds.cache.size,
      users: botClient.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
      ping: botClient.ws.ping,
      uptime: process.uptime()
    };
  }

  // FIX: السيرفرات الجديدة تظهر صح - تحويل permissions لـ BigInt
  function getUserGuilds(userGuilds) {
    if (!botClient) return [];
    return (userGuilds || [])
      .filter(g => {
        try {
          const perms = BigInt(g.permissions);
          return (perms & BigInt(0x8)) === BigInt(0x8) || (perms & BigInt(0x20)) === BigInt(0x20);
        } catch { return false; }
      })
      .map(g => ({
        ...g,
        botIn: botClient.guilds.cache.has(g.id),
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'png'}`
          : 'https://cdn.discordapp.com/embed/avatars/0.png',
        premium: isPremium(g.id)
      }));
  }

  // AUTH
  app.get('/auth/discord', passport.authenticate('discord'));

  // ✅ صفحة وسيطة - تفتح Discord لإضافة البوت وبعدين ترجع للداشبورد
  app.get('/invite/:guildId', isAuthenticated, (req, res) => {
    const { guildId } = req.params;
    const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`;
    res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>جاري إضافة البوت...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; color: #fff; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .box { text-align: center; padding: 2rem; background: #16213e; border-radius: 16px; max-width: 400px; }
    h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #aaa; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: bold; cursor: pointer; border: none; font-size: 1rem; }
    .btn-discord { background: #5865F2; color: white; margin-bottom: 0.75rem; width: 100%; }
    .btn-dashboard { background: #2ecc71; color: white; width: 100%; }
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size:3rem;margin-bottom:1rem">🤖</div>
    <h2>إضافة البوت للسيرفر</h2>
    <p>اضغط على الزر لإضافة البوت، ثم ارجع لهذه الصفحة</p>
    <a href="${inviteURL}" target="_blank" class="btn btn-discord" onclick="document.getElementById('step2').style.display='block'">
      ➕ إضافة البوت لديسكورد
    </a>
    <div id="step2" style="display:none;margin-top:1rem">
      <p style="color:#2ecc71;margin-bottom:0.75rem">✅ تم الإضافة؟ اضغط الزر أدناه</p>
      <a href="/dashboard/${guildId}" class="btn btn-dashboard">⚙️ الذهاب لإعدادات السيرفر</a>
    </div>
    <script>
      // لو رجع من Discord تلقائياً - روح للداشبورد
      window.addEventListener('focus', function() {
        setTimeout(() => {
          document.getElementById('step2').style.display = 'block';
        }, 1000);
      });
    </script>
  </div>
</body>
</html>`);
  });

  app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
      const guildId = req.query.guild_id;
      if (guildId) return res.redirect(`/dashboard/${guildId}`);
      return res.redirect('/dashboard');
    }
  );

  app.get('/auth/logout', (req, res) => req.logout(() => res.redirect('/')));

  // HOME
  app.get('/', (req, res) => {
    res.render('index', {
      user: req.user || null,
      stats: getBotStats(),
      isOwner: req.user ? checkOwner(req.user.id) : false,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  // DASHBOARD HOME
  app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
      user: req.user,
      guilds: getUserGuilds(req.user.guilds),
      stats: getBotStats(),
      isOwner: checkOwner(req.user.id),
      clientId: config.clientId,
      callbackURL: config.callbackURL,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  // GUILD SETTINGS
  app.get('/dashboard/:guildId', isAuthenticated, async (req, res) => {
    const { guildId } = req.params;
    const userGuild = (req.user.guilds || []).find(g => g.id === guildId);
    if (!userGuild) return res.redirect('/dashboard?error=no_permission');

    try {
      const perms = BigInt(userGuild.permissions);
      if ((perms & BigInt(0x8)) !== BigInt(0x8) && (perms & BigInt(0x20)) !== BigInt(0x20)) {
        return res.redirect('/dashboard?error=no_permission');
      }
    } catch { return res.redirect('/dashboard?error=no_permission'); }

    const guild = botClient?.guilds.cache.get(guildId);
    if (!guild) {
      // البوت مش في السيرفر - اعرض صفحة إضافة البوت
      const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}&redirect_uri=${encodeURIComponent(config.callbackURL)}&response_type=code&prompt=none`;
      return res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إضافة البوت</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#0d0d1a; color:#fff; font-family:'Tajawal',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .box { text-align:center; padding:2.5rem; background:#12122a; border:1px solid rgba(124,58,237,0.3); border-radius:20px; max-width:440px; width:90%; }
    .icon { font-size:4rem; margin-bottom:1rem; }
    h2 { font-size:1.6rem; margin-bottom:0.5rem; }
    p { color:#aaa; margin-bottom:1.5rem; line-height:1.6; }
    .btn { display:block; padding:0.85rem 2rem; border-radius:10px; text-decoration:none; font-weight:bold; font-size:1rem; margin-bottom:0.75rem; transition:opacity 0.2s; }
    .btn:hover { opacity:0.85; }
    .btn-discord { background:#5865F2; color:white; }
    .btn-back { background:#2a2a4a; color:#ccc; }
    #step2 { display:none; margin-top:1rem; padding:1rem; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:10px; }
    code { background:#1a1a3e; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.85rem; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">🤖</div>
    <h2>البوت غير موجود في السيرفر</h2>
    <p>لإدارة هذا السيرفر، يجب إضافة البوت أولاً ثم الانتظار لحظة</p>
    <a href="${inviteURL}" target="_blank" class="btn btn-discord" onclick="startWaiting()">➕ إضافة البوت للسيرفر</a>
    <div id="step2">
      <p style="color:#2ecc71;margin-bottom:0.75rem">✅ تمت الإضافة؟ انتظر 5 ثواني...</p>
      <a href="/dashboard/${guildId}" class="btn btn-discord" id="gotoBtn" style="display:none">⚙️ الذهاب لإعدادات السيرفر</a>
    </div>
    <a href="/dashboard" class="btn btn-back">← رجوع للداشبورد</a>
  </div>
  <script>
    function startWaiting() {
      document.getElementById('step2').style.display = 'block';
      setTimeout(() => {
        document.getElementById('gotoBtn').style.display = 'block';
      }, 5000);
    }
    window.addEventListener('focus', () => {
      document.getElementById('step2').style.display = 'block';
      setTimeout(() => {
        document.getElementById('gotoBtn').style.display = 'block';
      }, 3000);
    });
  </script>
</body>
</html>`);
    }

    const channels = guild.channels.cache
      .filter(c => c.type === 0)
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map(c => ({ id: c.id, name: c.name }));

    const roles = guild.roles.cache
      .filter(r => r.id !== guild.roles.everyone.id)
      .sort((a, b) => b.rawPosition - a.rawPosition)
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor }));

    const premium = isPremium(guildId);
    const settings = {
      prefix:          prefixDB.get(`prefix_${guildId}`) || config.prefix || '!',
      premium,

      // ✅ اختصارات الأوامر - 10 أسماء لكل أمر
      ...(() => {
        const cmds = ['help','ping','server','user','avatar','tax','ban','unban','kick','mute','unmute','clear','lock','unlock','hide','unhide','say','come'];
        const obj = {};
        cmds.forEach(k => {
          for (let i = 1; i <= 10; i++) {
            obj[`sc_${k}_${i}`] = shortcutDB.get(`sc_${k}_${i}_${guildId}`) || '';
          }
        });
        return obj;
      })(),
      custom_cmds: shortcutDB.get(`custom_cmds_${guildId}`) || [],

      welcome_channel:  systemDB.get(`welcome_channel_${guildId}`) || '',
      welcome_role:     systemDB.get(`welcome_role_${guildId}`) || '',
      welcome_image:    systemDB.get(`welcome_image_${guildId}`) || '',
      welcome_message:  systemDB.get(`welcome_message_${guildId}`) || 'مرحباً {user} في **{server}**! 🎉\nأنت العضو رقم **{count}**',
      leave_channel:    systemDB.get(`leave_channel_${guildId}`) || '',
      leave_message:    systemDB.get(`leave_message_${guildId}`) || 'وداعاً **{username}**، نتمنى أن تعود 👋',

      anti_server_edit:    protectDB.get(`anti_server_edit_${guildId}`) || false,
      anti_channel_edit:   protectDB.get(`anti_channel_edit_${guildId}`) || false,
      anti_channel_create: protectDB.get(`anti_channel_create_${guildId}`) || false,
      anti_role_create:    protectDB.get(`anti_role_create_${guildId}`) || false,
      anti_role_edit:      protectDB.get(`anti_role_edit_${guildId}`) || false,
      anti_kick:           protectDB.get(`anti_kick_${guildId}`) || false,
      anti_bots:           protectDB.get(`antibots_status_${guildId}`) === 'on',
      anti_ban:            protectDB.get(`ban_status_${guildId}`) === 'on',
      anti_webhook:        protectDB.get(`anti_webhook_${guildId}`) || false,
      protect_log:         protectDB.get(`set_protect_logs_${guildId}`) || '',

      log_messagedelete:  logsDB.get(`log_messagedelete_${guildId}`) || '',
      log_messageupdate:  logsDB.get(`log_messageupdate_${guildId}`) || '',
      log_rolecreate:     logsDB.get(`log_rolecreate_${guildId}`) || '',
      log_roledelete:     logsDB.get(`log_roledelete_${guildId}`) || '',
      log_rolegive:       logsDB.get(`log_rolegive_${guildId}`) || '',
      log_roleremove:     logsDB.get(`log_roleremove_${guildId}`) || '',
      log_channelcreate:  logsDB.get(`log_channelcreate_${guildId}`) || '',
      log_channeldelete:  logsDB.get(`log_channeldelete_${guildId}`) || '',
      log_banadd:         logsDB.get(`log_banadd_${guildId}`) || '',
      log_bandelete:      logsDB.get(`log_bandelete_${guildId}`) || '',
      log_kickadd:        logsDB.get(`log_kickadd_${guildId}`) || '',
      log_botadd:         logsDB.get(`log_botadd_${guildId}`) || '',

      tax_room:          taxDB.get(`tax_room_${guildId}`) || '',
      tax_mode:          taxDB.get(`tax_mode_${guildId}`) || 'embed',
      suggestions_room:  suggestionsDB.get(`suggestions_room_${guildId}`) || '',
      suggestion_mode:   suggestionsDB.get(`suggestion_mode_${guildId}`) || 'buttons',
      feedback_room:     feedbackDB.get(`feedback_room_${guildId}`) || '',
      feedback_mode:     feedbackDB.get(`feedback_mode_${guildId}`) || 'embed',
      ticket_log:        ticketDB.get(`LogsRoom_${guildId}`) || '',
      azkar_channel:     azkarDB.get(`azkar_channel_${guildId}`) || '',
      azkar_enabled:     azkarDB.get(`azkar_enabled_${guildId}`) || false,
      azkar_interval:    azkarDB.get(`azkar_interval_${guildId}`) || 30,
      auto_replys: (() => { try { return one4allDB.get(`replys_${guildId}`) || []; } catch { return []; } })(),
      ai_channel:        aiDB.get(`ai_channel_${guildId}`) || '',
      ai_enabled:        aiDB.get(`ai_enabled_${guildId}`) || false,
      level_enabled:     systemDB.get(`level_enabled_${guildId}`) || false,
      level_channel:     systemDB.get(`level_channel_${guildId}`) || '',
      whitelist:         protectDB.get(`whitelist_v2_${guildId}`) || {},
    };

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.render('guild2', {
      user: req.user,
      isOwner: checkOwner(req.user.id),
      guild: {
        id: guildId, name: guild.name,
        icon: guild.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
        memberCount: guild.memberCount, channels, roles
      },
      settings,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  // API SETTINGS
  app.post('/api/guild/:guildId/settings', isAuthenticated, async (req, res) => {
    const { guildId } = req.params;
    const userGuild = (req.user.guilds || []).find(g => g.id === guildId);
    if (!userGuild) return res.status(403).json({ error: 'لا صلاحية' });

    try {
      const perms = BigInt(userGuild.permissions);
      if ((perms & BigInt(0x8)) !== BigInt(0x8)) return res.status(403).json({ error: 'تحتاج صلاحية الأدمن' });
    } catch { return res.status(403).json({ error: 'خطأ في الصلاحيات' }); }

    const { section, data } = req.body;
    try {
      if (section === 'general') {
        if (data.prefix && data.prefix.length <= 5) prefixDB.set(`prefix_${guildId}`, data.prefix);
      }
      // ✅ اختصارات الأوامر - 10 أسماء لكل أمر
      if (section === 'shortcuts') {
        Object.keys(data).forEach(key => {
          if (key.startsWith('sc_')) {
            if (data[key]) shortcutDB.set(`${key}_${guildId}`, data[key]);
            else shortcutDB.delete(`${key}_${guildId}`);
          }
        });
      }
      // ✅ أوامر مخصصة
      if (section === 'custom_cmds') {
        const existing = shortcutDB.get(`custom_cmds_${guildId}`) || [];
        if (data.action === 'add' && data.cmd && data.reply) {
          if (existing.find(c => c.cmd === data.cmd)) return res.json({ error: 'الأمر موجود بالفعل!' });
          existing.push({ cmd: data.cmd, reply: data.reply });
          shortcutDB.set(`custom_cmds_${guildId}`, existing);
        }
        if (data.action === 'remove' && data.cmd) {
          shortcutDB.set(`custom_cmds_${guildId}`, existing.filter(c => c.cmd !== data.cmd));
        }
      }
      if (section === 'welcome') {
        if (data.welcome_channel !== undefined) systemDB.set(`welcome_channel_${guildId}`, data.welcome_channel);
        if (data.welcome_role !== undefined) systemDB.set(`welcome_role_${guildId}`, data.welcome_role);
        if (data.welcome_image !== undefined) systemDB.set(`welcome_image_${guildId}`, data.welcome_image);
        if (data.welcome_message !== undefined) systemDB.set(`welcome_message_${guildId}`, data.welcome_message);
        if (data.leave_channel !== undefined) systemDB.set(`leave_channel_${guildId}`, data.leave_channel);
        if (data.leave_message !== undefined) systemDB.set(`leave_message_${guildId}`, data.leave_message);
      }
      if (section === 'protection') {
        const guild = botClient?.guilds.cache.get(guildId);
        protectDB.set(`anti_server_edit_${guildId}`, !!data.anti_server_edit);
        protectDB.set(`anti_channel_edit_${guildId}`, !!data.anti_channel_edit);
        protectDB.set(`anti_channel_create_${guildId}`, !!data.anti_channel_create);
        protectDB.set(`anti_role_create_${guildId}`, !!data.anti_role_create);
        protectDB.set(`anti_role_edit_${guildId}`, !!data.anti_role_edit);
        protectDB.set(`anti_kick_${guildId}`, !!data.anti_kick);
        protectDB.set(`antibots_status_${guildId}`, data.anti_bots ? 'on' : 'off');
        protectDB.set(`ban_status_${guildId}`, data.anti_ban ? 'on' : 'off');
        protectDB.set(`anti_webhook_${guildId}`, !!data.anti_webhook);
        if (data.protect_log !== undefined) protectDB.set(`set_protect_logs_${guildId}`, data.protect_log);
        if (guild && data.anti_server_edit) {
          protectDB.set(`server_name_${guildId}`, guild.name);
          protectDB.set(`server_icon_${guildId}`, guild.iconURL({ dynamic: true, size: 4096 }));
          if (!protectDB.get(`ban_users_${guildId}`)) protectDB.set(`ban_users_${guildId}`, []);
        }
        if (guild && data.anti_channel_edit) {
          const snap = {};
          guild.channels.cache.forEach(ch => { snap[ch.id] = { name: ch.name, type: ch.type, parentId: ch.parentId || null }; });
          protectDB.set(`channels_snapshot_${guildId}`, snap);
        }
      }
      if (section === 'logs') {
        const logKeys = ['messagedelete','messageupdate','rolecreate','roledelete','rolegive','roleremove','channelcreate','channeldelete','banadd','bandelete','kickadd','botadd'];
        logKeys.forEach(key => {
          if (data[`log_${key}`] !== undefined) {
            if (data[`log_${key}`]) logsDB.set(`log_${key}_${guildId}`, data[`log_${key}`]);
            else logsDB.delete(`log_${key}_${guildId}`);
          }
        });
      }
      if (section === 'tax') {
        if (data.tax_room !== undefined) taxDB.set(`tax_room_${guildId}`, data.tax_room);
        if (data.tax_mode) taxDB.set(`tax_mode_${guildId}`, data.tax_mode);
      }
      if (section === 'suggestions') {
        if (data.suggestions_room !== undefined) suggestionsDB.set(`suggestions_room_${guildId}`, data.suggestions_room);
        if (data.suggestion_mode) suggestionsDB.set(`suggestion_mode_${guildId}`, data.suggestion_mode);
      }
      if (section === 'feedback') {
        if (data.feedback_room !== undefined) feedbackDB.set(`feedback_room_${guildId}`, data.feedback_room);
        if (data.feedback_mode) feedbackDB.set(`feedback_mode_${guildId}`, data.feedback_mode);
      }
      if (section === 'azkar') {
        if (data.azkar_channel !== undefined) azkarDB.set(`azkar_channel_${guildId}`, data.azkar_channel);
        azkarDB.set(`azkar_enabled_${guildId}`, !!data.azkar_enabled);
        if (data.azkar_interval) azkarDB.set(`azkar_interval_${guildId}`, parseInt(data.azkar_interval));
      }
      if (section === 'ai') {
        if (data.ai_channel !== undefined) aiDB.set(`ai_channel_${guildId}`, data.ai_channel);
        aiDB.set(`ai_enabled_${guildId}`, !!data.ai_enabled);
      }
      if (section === 'ticket') {
        if (data.ticket_log !== undefined) ticketDB.set(`LogsRoom_${guildId}`, data.ticket_log);
      }
      if (section === 'autoreply') {
        if (data.action === 'add' && data.word && data.reply) {
          const existing = one4allDB.get(`replys_${guildId}`) || [];
          if (existing.find(r => r.word === data.word)) return res.json({ error: 'هذا الرد موجود بالفعل!' });
          existing.push({ word: data.word, reply: data.reply, addedBy: req.user.id });
          one4allDB.set(`replys_${guildId}`, existing);
        }
        if (data.action === 'remove' && data.word) {
          const existing = one4allDB.get(`replys_${guildId}`) || [];
          one4allDB.set(`replys_${guildId}`, existing.filter(r => r.word !== data.word));
        }
      }
      if (section === 'levels') {
        systemDB.set(`level_enabled_${guildId}`, !!data.level_enabled);
        if (data.level_channel !== undefined) systemDB.set(`level_channel_${guildId}`, data.level_channel);
      }
      if (section === 'whitelist_add') {
        if (data.userId && /^\d{17,20}$/.test(data.userId)) {
          const wl = protectDB.get(`whitelist_v2_${guildId}`) || {};
          if (!wl[data.userId]) wl[data.userId] = [];
          if (data.type === 'all') { wl[data.userId] = ['all']; }
          else if (!wl[data.userId].includes(data.type) && !wl[data.userId].includes('all')) {
            wl[data.userId].push(data.type);
          }
          protectDB.set(`whitelist_v2_${guildId}`, wl);
        }
      }
      if (section === 'whitelist_remove') {
        if (data.userId) {
          const wl = protectDB.get(`whitelist_v2_${guildId}`) || {};
          delete wl[data.userId];
          protectDB.set(`whitelist_v2_${guildId}`, wl);
        }
      }
      if (section === 'whitelist_clear') {
        protectDB.set(`whitelist_v2_${guildId}`, {});
        protectDB.set(`whitelist_roles_${guildId}`, {});
      }
      return res.json({ success: true, message: '✅ تم الحفظ بنجاح' });
    } catch (err) {
      console.error('API save error:', err);
      return res.status(500).json({ error: 'خطأ: ' + err.message });
    }
  });

  // API ACTIONS
  app.post('/api/guild/:guildId/action', isAuthenticated, async (req, res) => {
    const { guildId } = req.params;
    const { action, data } = req.body;
    const userGuild = (req.user.guilds || []).find(g => g.id === guildId);
    if (!userGuild) return res.status(403).json({ error: 'لا صلاحية' });
    if (!botClient) return res.status(503).json({ error: 'البوت غير متصل' });
    const guild = botClient.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'البوت غير موجود في السيرفر' });

    try {
      if (action === 'send_message') {
        const channel = guild.channels.cache.get(data.channelId);
        if (!channel) return res.status(404).json({ error: 'الروم غير موجود' });
        await channel.send(data.message);
        return res.json({ success: true, message: '✅ تم الإرسال' });
      }
      if (['ban_user','kick_user','unban_user'].includes(action) && !isPremium(guildId)) {
        return res.status(403).json({ error: '👑 هذه الميزة للسيرفرات المميزة فقط' });
      }
      if (action === 'ban_user') {
        await guild.bans.create(data.userId, { reason: data.reason || 'Dashboard' });
        return res.json({ success: true, message: '✅ تم الباند' });
      }
      if (action === 'kick_user') {
        const member = guild.members.cache.get(data.userId) || await guild.members.fetch(data.userId).catch(() => null);
        if (!member) return res.status(404).json({ error: 'العضو غير موجود' });
        await member.kick(data.reason || 'Dashboard');
        return res.json({ success: true, message: '✅ تم الكيك' });
      }
      if (action === 'unban_user') {
        await guild.bans.remove(data.userId);
        return res.json({ success: true, message: '✅ تم رفع الباند' });
      }
      if (action === 'lock_channel') {
        const channel = guild.channels.cache.get(data.channelId);
        if (!channel) return res.status(404).json({ error: 'الروم غير موجود' });
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
        return res.json({ success: true, message: '🔒 تم القفل' });
      }
      if (action === 'unlock_channel') {
        const channel = guild.channels.cache.get(data.channelId);
        if (!channel) return res.status(404).json({ error: 'الروم غير موجود' });
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
        return res.json({ success: true, message: '🔓 تم الفتح' });
      }
      return res.status(400).json({ error: 'Action غير معروف' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/stats', (req, res) => res.json(getBotStats()));

  // OWNER PANEL
  app.get('/owner', isAuthenticated, isOwnerMW, (req, res) => {
    const guilds = botClient ? [...botClient.guilds.cache.map(g => ({
      id: g.id, name: g.name,
      icon: g.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
      memberCount: g.memberCount, premium: isPremium(g.id),
      premiumExpiry: (() => {
        const exp = premiumDB.get(`premium_${g.id}`);
        return exp ? new Date(exp).toLocaleDateString('ar-EG') : null;
      })()
    })).values()] : [];

    res.render('owner', {
      user: req.user, stats: getBotStats(), guilds, isOwner: true,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  // OWNER API PREMIUM
  app.post('/api/owner/premium', isAuthenticated, isOwnerMW, (req, res) => {
    const { guildId, days, action } = req.body;
    if (!guildId) return res.status(400).json({ error: 'أدخل ID السيرفر' });
    if (action === 'add') {
      const daysNum = parseInt(days) || 30;
      premiumDB.set(`premium_${guildId}`, Date.now() + daysNum * 24 * 60 * 60 * 1000);
      const name = botClient?.guilds.cache.get(guildId)?.name || guildId;
      return res.json({ success: true, message: `✅ تم منح Premium ${daysNum} يوم لـ ${name}` });
    }
    if (action === 'remove') {
      premiumDB.delete(`premium_${guildId}`);
      const name = botClient?.guilds.cache.get(guildId)?.name || guildId;
      return res.json({ success: true, message: `❌ تم سحب Premium من ${name}` });
    }
    res.status(400).json({ error: 'action غير صحيح' });
  });

  app.get('/api/check-premium/:guildId', (req, res) => {
    const expiry = premiumDB.get(`premium_${req.params.guildId}`);
    res.json({ premium: isPremium(req.params.guildId), expiresAt: expiry ? new Date(expiry).toLocaleDateString('ar-EG') : null });
  });

  app.get('/commands', (req, res) => {
    res.render('commands', {
      user: req.user || null, isOwner: req.user ? checkOwner(req.user.id) : false,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  app.get('/premium', (req, res) => {
    const premiumGuilds = botClient ? [...botClient.guilds.cache.filter(g => isPremium(g.id)).map(g => ({
      id: g.id, name: g.name, icon: g.iconURL({ dynamic: true })
    })).values()] : [];
    res.render('premium', {
      user: req.user || null, isOwner: req.user ? checkOwner(req.user.id) : false,
      paymentInfo: config.payment, premiumGuilds,
      botName: botClient?.user?.username || 'one4all',
      botAvatar: botClient?.user?.displayAvatarURL({ dynamic: true, size: 256 }) || ''
    });
  });

  const port = process.env.PORT || config.dashboardPort || 3000;
  app.listen(port, '0.0.0.0', () => console.log(`🌐 Dashboard: http://localhost:${port}`));
}

module.exports = { startDashboard };
