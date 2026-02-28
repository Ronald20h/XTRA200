// ======================================
// ====== نظام الليفل والـ XP ===========
// ======================================

const { EmbedBuilder } = require('discord.js');
const { levelDB, systemDB } = require('../db-manager');

function xpForLevel(level) {
  return 100 * (level + 1) * (level + 1);
}

function getLevelFromXP(xp) {
  let level = 0;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, remaining, needed: xpForLevel(level) };
}

const cooldowns = new Map();

function initLevelSystem(client) {
  client.on('messageCreate', async (message) => {
    try {
      if (message.author.bot || !message.guild) return;

      const guildId = message.guild.id;
      const enabled = systemDB.get(`level_enabled_${guildId}`);
      if (!enabled) return;

      const userId = message.author.id;
      const key = `${guildId}_${userId}`;
      const now = Date.now();

      // كولداون دقيقة
      if (cooldowns.has(key) && now - cooldowns.get(key) < 60000) return;
      cooldowns.set(key, now);

      // جلب بيانات العضو
      let userData = levelDB.get(key) || { xp: 0, level: 0, messages: 0 };
      const xpGain = Math.floor(Math.random() * 11) + 15;
      userData.xp = (userData.xp || 0) + xpGain;
      userData.messages = (userData.messages || 0) + 1;

      const { level: newLevel } = getLevelFromXP(userData.xp);
      const oldLevel = userData.level || 0;
      userData.level = newLevel;
      levelDB.set(key, userData);

      // إشعار الترقي
      if (newLevel > oldLevel) {
        const levelChannelId = systemDB.get(`level_channel_${guildId}`);
        const channel = levelChannelId
          ? message.guild.channels.cache.get(levelChannelId)
          : message.channel;
        if (!channel) return;

        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🎉 ارتقيت ليفل!')
          .setDescription(`مبروك <@${userId}>! وصلت للـ **Level ${newLevel}** 🚀`)
          .setThumbnail(message.author.displayAvatarURL({ extension: 'png', size: 128 }))
          .addFields(
            { name: '⭐ الليفل الجديد', value: `**${newLevel}**`, inline: true },
            { name: '💬 عدد الرسائل', value: `**${userData.messages}**`, inline: true }
          )
          .setTimestamp();

        await channel.send({ content: `<@${userId}>`, embeds: [embed] });

        // رتبة المستوى
        const levelRole = systemDB.get(`level_role_${guildId}_${newLevel}`);
        if (levelRole) {
          const role = message.guild.roles.cache.get(levelRole);
          if (role) await message.member.roles.add(role).catch(() => {});
        }
      }
    } catch (e) {
      console.error('[LevelSystem]', e);
    }
  });

  console.log('✅ Level system loaded');
}

module.exports = initLevelSystem;
module.exports.levelDB = levelDB;
module.exports.getLevelFromXP = getLevelFromXP;
module.exports.xpForLevel = xpForLevel;
