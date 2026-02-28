// =============================================
// ====== نظام اللوج الكامل - مصلح ============
// =============================================
const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { logsDB } = require('../db-manager');

function getLogChannel(guild, key) {
  const channelId = logsDB.get(`log_${key}_${guild.id}`);
  if (!channelId) return null;
  return guild.channels.cache.get(channelId) || null;
}

async function sendLog(guild, key, embed) {
  const channel = getLogChannel(guild, key);
  if (!channel) return;
  try { await channel.send({ embeds: [embed] }); } catch {}
}

module.exports = (client) => {

  // ===== حذف رسالة =====
  client.on('messageDelete', async (message) => {
    if (!message.guild || message.author?.bot) return;
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🗑️ تم حذف رسالة')
      .setThumbnail(message.author?.displayAvatarURL({ dynamic: true }) || null)
      .addFields(
        { name: '👤 المرسل', value: `${message.author?.tag || 'Unknown'} (${message.author?.id || '?'})`, inline: true },
        { name: '📢 الروم', value: `${message.channel}`, inline: true },
        { name: '💬 المحتوى', value: message.content ? `\`\`\`${message.content.slice(0,500)}\`\`\`` : '*بدون نص*', inline: false }
      )
      .setTimestamp();
    await sendLog(message.guild, 'messagedelete', embed);
  });

  // ===== تعديل رسالة =====
  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (!newMsg.guild || newMsg.author?.bot) return;
    if (oldMsg.content === newMsg.content) return;
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('✏️ تم تعديل رسالة')
      .setThumbnail(newMsg.author?.displayAvatarURL({ dynamic: true }) || null)
      .addFields(
        { name: '👤 العضو', value: `${newMsg.author?.tag || 'Unknown'}`, inline: true },
        { name: '📢 الروم', value: `${newMsg.channel}`, inline: true },
        { name: '📝 قبل', value: `\`\`\`${(oldMsg.content || '*فارغ*').slice(0,400)}\`\`\``, inline: false },
        { name: '📝 بعد', value: `\`\`\`${(newMsg.content || '*فارغ*').slice(0,400)}\`\`\``, inline: false },
        { name: '🔗 الرسالة', value: `[اضغط هنا](${newMsg.url})`, inline: true }
      )
      .setTimestamp();
    await sendLog(newMsg.guild, 'messageupdate', embed);
  });

  // ===== إنشاء رتبة =====
  client.on('roleCreate', async (role) => {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🆕 تم إنشاء رتبة')
      .addFields(
        { name: '🎭 اسم الرتبة', value: role.name, inline: true },
        { name: '🎨 اللون', value: role.hexColor, inline: true },
        { name: '🆔 الآيدي', value: `\`${role.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(role.guild, 'rolecreate', embed);
  });

  // ===== حذف رتبة =====
  client.on('roleDelete', async (role) => {
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('❌ تم حذف رتبة')
      .addFields(
        { name: '🎭 اسم الرتبة', value: role.name, inline: true },
        { name: '🆔 الآيدي', value: `\`${role.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(role.guild, 'roledelete', embed);
  });

  // ===== إعطاء/إزالة رتبة =====
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (addedRoles.size > 0) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ تم إعطاء رتبة')
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 العضو', value: `${newMember.user.tag}`, inline: true },
          { name: '🎭 الرتبة', value: addedRoles.map(r=>`<@&${r.id}>`).join(', '), inline: true }
        )
        .setTimestamp();
      await sendLog(newMember.guild, 'rolegive', embed);
    }

    if (removedRoles.size > 0) {
      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('➖ تم إزالة رتبة')
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 العضو', value: `${newMember.user.tag}`, inline: true },
          { name: '🎭 الرتبة', value: removedRoles.map(r=>`<@&${r.id}>`).join(', '), inline: true }
        )
        .setTimestamp();
      await sendLog(newMember.guild, 'roleremove', embed);
    }
  });

  // ===== إنشاء روم =====
  client.on('channelCreate', async (channel) => {
    if (!channel.guild) return;
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📢 تم إنشاء روم')
      .addFields(
        { name: '📝 الاسم', value: channel.name, inline: true },
        { name: '📁 النوع', value: `\`${channel.type}\``, inline: true },
        { name: '🆔 الآيدي', value: `\`${channel.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(channel.guild, 'channelcreate', embed);
  });

  // ===== حذف روم =====
  client.on('channelDelete', async (channel) => {
    if (!channel.guild) return;
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🗑️ تم حذف روم')
      .addFields(
        { name: '📝 الاسم', value: channel.name, inline: true },
        { name: '🆔 الآيدي', value: `\`${channel.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(channel.guild, 'channeldelete', embed);
  });

  // ===== باند =====
  client.on('guildBanAdd', async (ban) => {
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🔨 تم الباند')
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 العضو', value: `${ban.user.tag}`, inline: true },
        { name: '🆔 الآيدي', value: `\`${ban.user.id}\``, inline: true },
        { name: '📝 السبب', value: ban.reason || 'لم يُذكر', inline: true }
      )
      .setTimestamp();
    await sendLog(ban.guild, 'banadd', embed);
  });

  // ===== رفع باند =====
  client.on('guildBanRemove', async (ban) => {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🔓 تم رفع الباند')
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 العضو', value: `${ban.user.tag}`, inline: true },
        { name: '🆔 الآيدي', value: `\`${ban.user.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(ban.guild, 'bandelete', embed);
  });

  // ===== كيك =====
  client.on('guildMemberRemove', async (member) => {
    try {
      await new Promise(r => setTimeout(r, 1000));
      const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
      const entry = logs.entries.first();
      if (!entry) return;
      if (entry.target.id !== member.id) return;
      if ((Date.now() - entry.createdTimestamp) > 5000) return;

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('👟 تم الكيك')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '👤 العضو', value: `${member.user.tag}`, inline: true },
          { name: '👮 بواسطة', value: `${entry.executor?.tag || 'Unknown'}`, inline: true },
          { name: '📝 السبب', value: entry.reason || 'لم يُذكر', inline: true }
        )
        .setTimestamp();
      await sendLog(member.guild, 'kickadd', embed);
    } catch {}
  });

  // ===== إضافة بوت =====
  client.on('guildMemberAdd', async (member) => {
    if (!member.user.bot) return;
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 تم إضافة بوت')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🤖 البوت', value: member.user.username, inline: true },
        { name: '🆔 الآيدي', value: `\`${member.id}\``, inline: true }
      )
      .setTimestamp();
    await sendLog(member.guild, 'botadd', embed);
  });

  console.log('✅ Logs system loaded');
};
