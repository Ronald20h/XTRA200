// ======================================
// ====== نظام الترحيب - محسّن =========
// ======================================
const { EmbedBuilder } = require('discord.js');
const { systemDB } = require('../db-manager');

module.exports = (client) => {

  client.on('guildMemberAdd', async (member) => {
    try {
      const guild = member.guild;
      const channelId = systemDB.get(`welcome_channel_${guild.id}`);
      if (!channelId) return;
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return;

      const welcomeMsg = systemDB.get(`welcome_message_${guild.id}`) ||
        'مرحباً {user} في **{server}**! 🎉\nأنت العضو رقم **{count}**';
      const welcomeImg = systemDB.get(`welcome_image_${guild.id}`) || '';
      const welcomeRole = systemDB.get(`welcome_role_${guild.id}`);

      const text = welcomeMsg
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, guild.name)
        .replace(/{count}/g, guild.memberCount)
        .replace(/{id}/g, member.id);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎉 عضو جديد في ${guild.name}!`)
        .setDescription(text)
        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
        .addFields(
          { name: '👤 المستخدم', value: member.user.username, inline: true },
          { name: '🆔 الآيدي', value: `\`${member.id}\``, inline: true },
          { name: '📅 انضم', value: `<t:${Math.floor(Date.now()/1000)}:R>`, inline: true },
          { name: '👥 عدد الأعضاء', value: `**${guild.memberCount}**`, inline: true }
        )
        .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
        .setTimestamp();

      if (welcomeImg) embed.setImage(welcomeImg);

      await channel.send({
        content: `> 👋 أهلاً وسهلاً <@${member.id}>!`,
        embeds: [embed]
      });

      if (welcomeRole) {
        const role = guild.roles.cache.get(welcomeRole);
        if (role) await member.roles.add(role).catch(() => {});
      }
    } catch (e) {
      console.error('[Welcome] Error:', e.message);
    }
  });

  client.on('guildMemberRemove', async (member) => {
    try {
      const guild = member.guild;
      const channelId = systemDB.get(`leave_channel_${guild.id}`);
      if (!channelId) return;
      const channel = guild.channels.cache.get(channelId);
      if (!channel) return;

      const leaveMsg = systemDB.get(`leave_message_${guild.id}`) ||
        'وداعاً **{username}**، نتمنى أن تعود قريباً 👋';
      const leaveImg = systemDB.get(`leave_image_${guild.id}`) || '';

      const text = leaveMsg
        .replace(/{user}/g, member.user.username)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, guild.name)
        .replace(/{count}/g, guild.memberCount);

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle(`👋 غادر السيرفر`)
        .setDescription(text)
        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 256 }))
        .addFields(
          { name: '👤 المستخدم', value: member.user.username, inline: true },
          { name: '👥 الأعضاء الآن', value: `**${guild.memberCount}**`, inline: true }
        )
        .setFooter({ text: guild.name, iconURL: guild.iconURL() || undefined })
        .setTimestamp();

      if (leaveImg) embed.setImage(leaveImg);
      await channel.send({ embeds: [embed] });
    } catch (e) {
      console.error('[Leave] Error:', e.message);
    }
  });

  console.log('✅ Welcome/Leave system loaded');
};
