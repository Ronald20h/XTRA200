// =============================================
// ====== نظام أوامر البريفكس - كامل ==========
// =============================================
const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { prefixDB, one4allDB, shortcutDB } = require('../db-manager');
const config      = require('../config');

// جلب كل الأسماء البديلة للسيرفر (10 لكل أمر)
function getShortcuts(guildId) {
  const cmds = ['help','ping','server','user','avatar','tax','ban','unban','kick','mute','unmute','clear','lock','unlock','hide','unhide','say','come','rename','ticket-close','ticket-add','ticket-remove'];
  const map = {};
  cmds.forEach(k => {
    for (let i = 1; i <= 10; i++) {
      const alias = shortcutDB.get(`sc_${k}_${i}_${guildId}`);
      if (alias) map[alias.toLowerCase()] = k;
    }
  });
  return map;
}

function getPrefix(guildId) {
  return prefixDB.get(`prefix_${guildId}`) || config.prefix || '!';
}

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const prefix = getPrefix(guildId);
    const content = message.content.trim();

    // ======= الرد التلقائي =======
    const replys = one4allDB.get(`replys_${guildId}`) || [];
    for (const r of replys) {
      if (content.toLowerCase().includes(r.word.toLowerCase())) {
        await message.reply(r.reply).catch(() => {});
        break;
      }
    }

    // تحقق من البريفكس
    if (!content.startsWith(prefix)) return;

    const args = content.slice(prefix.length).trim().split(/\s+/);
    let cmd = args.shift().toLowerCase();

    // ✅ تحويل الاختصار للأمر الأصلي
    const shortcuts = getShortcuts(guildId);
    if (shortcuts[cmd]) cmd = shortcuts[cmd];

    // ✅ أوامر مخصصة
    const customCmds = shortcutDB.get(`custom_cmds_${guildId}`) || [];
    const customMatch = customCmds.find(c => c.cmd.toLowerCase() === cmd);
    if (customMatch) {
      return message.reply(customMatch.reply).catch(() => {});
    }

    // ======= !help =======
    if (cmd === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📋 أوامر ${client.user.username}`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '```99 أمر```', value: '\u200b', inline: false },
          { name: '🔧 عام', value: `\`${prefix}ping\` \`${prefix}help\` \`${prefix}server\` \`${prefix}user\` \`${prefix}avatar\``, inline: false },
          { name: '⚙️ إشراف', value: `\`${prefix}ban\` \`${prefix}kick\` \`${prefix}mute\` \`${prefix}unmute\` \`${prefix}clear\` \`${prefix}lock\` \`${prefix}unlock\` \`${prefix}hide\` \`${prefix}unhide\``, inline: false },
          { name: '📝 الرومات', value: `\`${prefix}rename [اسم]\` - تغيير اسم الروم الحالي`, inline: false },
          { name: '🎫 تكت', value: `\`${prefix}ticket-close\` \`${prefix}ticket-add @عضو\` \`${prefix}ticket-remove @عضو\``, inline: false },
          { name: '💬 متنوع', value: `\`${prefix}say\` \`${prefix}come\` \`${prefix}tax\` \`${prefix}زخرفة\``, inline: false },
          { name: '⚡ السلاش', value: 'استخدم `/` لرؤية كل الأوامر المتاحة (99 أمر)', inline: false }
        )
        .setFooter({ text: `البريفكس: ${prefix} | ${message.guild.name}` })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

        // ======= !ping =======
    if (cmd === 'ping') {
      const uptime = process.uptime();
      const d = Math.floor(uptime/86400), h = Math.floor((uptime%86400)/3600),
            m = Math.floor((uptime%3600)/60), s = Math.floor(uptime%60);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '⚡ البينج', value: `\`${client.ws.ping}ms\``, inline: true },
          { name: '🏠 السيرفرات', value: `\`${client.guilds.cache.size}\``, inline: true },
          { name: '⏱️ وقت التشغيل', value: `\`${d}d ${h}h ${m}m ${s}s\``, inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // ======= !server =======
    if (cmd === 'server') {
      const g = message.guild;
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(g.name)
        .setThumbnail(g.iconURL({ dynamic: true }))
        .addFields(
          { name: '👑 الأونر', value: `<@${g.ownerId}>`, inline: true },
          { name: '👥 الأعضاء', value: `\`${g.memberCount}\``, inline: true },
          { name: '📢 الرومات', value: `\`${g.channels.cache.size}\``, inline: true },
          { name: '🎭 الرتب', value: `\`${g.roles.cache.size}\``, inline: true },
          { name: '📅 تم الإنشاء', value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true },
          { name: '🆔 الآيدي', value: `\`${g.id}\``, inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // ======= !user =======
    if (cmd === 'user') {
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(target.user.username)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '🆔 الآيدي', value: `\`${target.id}\``, inline: true },
          { name: '📅 انضم للسيرفر', value: `<t:${Math.floor(target.joinedTimestamp/1000)}:R>`, inline: true },
          { name: '📅 إنشاء الحساب', value: `<t:${Math.floor(target.user.createdTimestamp/1000)}:R>`, inline: true },
          { name: '🎭 الرتب', value: target.roles.cache.filter(r=>r.id!==message.guild.roles.everyone.id).map(r=>`<@&${r.id}>`).join(' ') || 'لا يوجد', inline: false }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // ======= !avatar =======
    if (cmd === 'avatar') {
      const target = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`صورة ${target.username}`)
        .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }));
      return message.reply({ embeds: [embed] });
    }

    // ======= !say =======
    if (cmd === 'say') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
        return message.reply('❌ تحتاج صلاحية إدارة الرسائل');
      const text = args.join(' ');
      if (!text) return message.reply('❌ اكتب نصاً بعد الأمر');
      await message.delete().catch(() => {});
      const files = message.attachments.size > 0 ? [message.attachments.first().url] : [];
      return message.channel.send({ content: text, files });
    }

    // ======= !clear =======
    if (cmd === 'clear' || cmd === 'purge') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply('❌ تحتاج صلاحية إدارة الرسائل');
      const amount = parseInt(args[0]) || 10;
      if (amount < 1 || amount > 100) return message.reply('❌ أدخل رقم بين 1 و 100');
      try {
        const msgs = await message.channel.messages.fetch({ limit: amount + 1 });
        const toDelete = msgs.filter(m => (Date.now() - m.createdTimestamp) < 14*24*60*60*1000);
        await message.channel.bulkDelete(toDelete, true);
        const reply = await message.channel.send(`✅ تم حذف \`${toDelete.size - 1}\` رسالة`);
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      } catch (e) { message.reply('❌ خطأ: ' + e.message); }
      return;
    }

    // ======= !ban =======
    if (cmd === 'ban') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply('❌ تحتاج صلاحية الباند');
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply('❌ البوت لا يملك صلاحية الباند');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو بالمنشن أو الآيدي');
      const reason = args.slice(1).join(' ') || 'لم يُذكر سبب';
      try {
        await target.ban({ reason });
        const embed = new EmbedBuilder().setColor('#ED4245').setTitle('🔨 تم الباند')
          .addFields(
            { name: '👤 العضو', value: target.user.username, inline: true },
            { name: '📝 السبب', value: reason, inline: true },
            { name: '👮 بواسطة', value: message.author.username, inline: true }
          ).setTimestamp();
        message.reply({ embeds: [embed] });
      } catch (e) { message.reply('❌ فشل الباند: ' + e.message); }
      return;
    }

    // ======= !unban =======
    if (cmd === 'unban') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply('❌ تحتاج صلاحية الباند');
      const userId = args[0];
      if (!userId) return message.reply('❌ أدخل آيدي العضو');
      try {
        await message.guild.bans.remove(userId);
        message.reply(`✅ تم رفع الباند عن \`${userId}\``);
      } catch (e) { message.reply('❌ فشل رفع الباند: ' + e.message); }
      return;
    }

    // ======= !kick =======
    if (cmd === 'kick') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return message.reply('❌ تحتاج صلاحية الكيك');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو');
      const reason = args.slice(1).join(' ') || 'لم يُذكر سبب';
      try {
        await target.kick(reason);
        const embed = new EmbedBuilder().setColor('#FFA500').setTitle('👟 تم الكيك')
          .addFields(
            { name: '👤 العضو', value: target.user.username, inline: true },
            { name: '📝 السبب', value: reason, inline: true }
          ).setTimestamp();
        message.reply({ embeds: [embed] });
      } catch (e) { message.reply('❌ فشل الكيك: ' + e.message); }
      return;
    }

    // ======= !mute =======
    if (cmd === 'mute' || cmd === 'timeout') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply('❌ تحتاج صلاحية التايم أوت');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو');
      const duration = parseInt(args[1]) || 10; // بالدقائق
      try {
        await target.timeout(duration * 60 * 1000);
        message.reply(`✅ تم عمل تايم أوت لـ **${target.user.username}** مدة **${duration}** دقيقة`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !unmute =======
    if (cmd === 'unmute') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply('❌ تحتاج صلاحية التايم أوت');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو');
      try {
        await target.timeout(null);
        message.reply(`✅ تم رفع التايم أوت عن **${target.user.username}**`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !lock =======
    if (cmd === 'lock') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ تحتاج صلاحية إدارة الرومات');
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply(`🔒 تم قفل **${message.channel.name}**`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !unlock =======
    if (cmd === 'unlock') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ تحتاج صلاحية إدارة الرومات');
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.reply(`🔓 تم فتح **${message.channel.name}**`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !hide =======
    if (cmd === 'hide') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ تحتاج صلاحية إدارة الرومات');
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false });
        message.reply(`👁️ تم إخفاء **${message.channel.name}**`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !unhide =======
    if (cmd === 'unhide') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ تحتاج صلاحية إدارة الرومات');
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: true });
        message.reply(`✅ تم إظهار **${message.channel.name}**`);
      } catch (e) { message.reply('❌ فشل: ' + e.message); }
      return;
    }

    // ======= !come =======
    if (cmd === 'come') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply('❌ تحتاج صلاحية إدارة الرسائل');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو');
      try {
        await target.send(`**تم استدعائك بواسطة ${message.author} في ${message.channel}**`);
        message.reply('✅ تم إرسال الاستدعاء');
      } catch { message.reply('❌ لا يمكن إرسال رسالة لهذا العضو'); }
      return;
    }

    // ======= !tax =======
    if (cmd === 'tax') {
      let num = parseFloat(args[0]);
      if (!args[0]) return message.reply(`❌ استخدم: \`${prefix}tax [المبلغ]\``);
      if (args[0].endsWith('k') || args[0].endsWith('K')) num = parseFloat(args[0]) * 1000;
      if (args[0].endsWith('m') || args[0].endsWith('M')) num = parseFloat(args[0]) * 1000000;
      if (isNaN(num)) return message.reply('❌ أدخل رقماً صحيحاً');
      const tax = Math.floor(num * 20/19 + 1);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('💰 حساب الضريبة')
        .addFields(
          { name: '💵 المبلغ', value: `\`${num.toLocaleString()}\``, inline: true },
          { name: '📊 مع الضريبة', value: `\`${tax.toLocaleString()}\``, inline: true },
          { name: '📈 الضريبة فقط', value: `\`${(tax-num).toLocaleString()}\``, inline: true }
        ).setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // ======= !زخرفة =======
    if (cmd === 'زخرفة') {
      const text = args.join(' ');
      if (!text) return message.reply(`❌ استخدم: \`${prefix}زخرفة [النص]\``);
      const styles = [
        t => t.split('').map(c=>'𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'['abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase())]||c).join(''),
        t => `꧁${t}꧂`,
        t => `『${t}』`,
        t => `【${t}】`,
        t => t.split('').join('·'),
      ];
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('✨ زخرفة النص')
        .setDescription(styles.map((s,i) => `**${i+1}.** ${s(text)}`).join('\n'))
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // ======= !rename =======
    if (cmd === 'rename') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ تحتاج صلاحية إدارة الرومات');
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply('❌ البوت لا يملك صلاحية إدارة الرومات');
      const newName = args.join('-');
      if (!newName) return message.reply(`❌ استخدم: \`${prefix}rename [الاسم الجديد]\``);
      if (newName.length > 100) return message.reply('❌ الاسم طويل جداً (الحد 100 حرف)');
      try {
        const oldName = message.channel.name;
        await message.channel.setName(newName);
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('✏️ تم تغيير اسم الروم')
          .addFields(
            { name: '📌 الاسم القديم', value: `\`${oldName}\``, inline: true },
            { name: '✅ الاسم الجديد', value: `\`${newName}\``, inline: true },
            { name: '👮 بواسطة', value: message.author.username, inline: true }
          ).setTimestamp();
        return message.reply({ embeds: [embed] });
      } catch (e) { return message.reply('❌ فشل: ' + e.message); }
    }

    // ======= !ticket-close =======
    if (cmd === 'ticket-close') {
      const { ticketDB } = require('../db-manager');
      const ticketData = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
      if (!ticketData) return message.reply('❌ هذا الروم ليس تكت');
      const supportRoleID = ticketData.Support;
      if (!message.member.roles.cache.has(supportRoleID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply('❌ ليس لديك صلاحية إغلاق هذا التكت');
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false, ViewChannel: false });
        const embed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🔒 تم إغلاق التكت')
          .setDescription(`تم الإغلاق بواسطة ${message.author}`)
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      } catch (e) { return message.reply('❌ فشل: ' + e.message); }
    }

    // ======= !ticket-add =======
    if (cmd === 'ticket-add') {
      const { ticketDB } = require('../db-manager');
      const ticketData = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
      if (!ticketData) return message.reply('❌ هذا الروم ليس تكت');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو بالمنشن أو الآيدي');
      const supportRoleID = ticketData.Support;
      if (!message.member.roles.cache.has(supportRoleID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply('❌ ليس لديك صلاحية');
      try {
        await message.channel.permissionOverwrites.edit(target, { ViewChannel: true, SendMessages: true });
        return message.reply(`✅ تم إضافة ${target} للتكت`);
      } catch (e) { return message.reply('❌ فشل: ' + e.message); }
    }

    // ======= !ticket-remove =======
    if (cmd === 'ticket-remove') {
      const { ticketDB } = require('../db-manager');
      const ticketData = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
      if (!ticketData) return message.reply('❌ هذا الروم ليس تكت');
      const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
      if (!target) return message.reply('❌ حدد العضو بالمنشن أو الآيدي');
      const supportRoleID = ticketData.Support;
      if (!message.member.roles.cache.has(supportRoleID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply('❌ ليس لديك صلاحية');
      try {
        await message.channel.permissionOverwrites.delete(target);
        return message.reply(`✅ تم إزالة ${target} من التكت`);
      } catch (e) { return message.reply('❌ فشل: ' + e.message); }
    }

  });


  console.log('✅ Prefix commands system loaded');
};
