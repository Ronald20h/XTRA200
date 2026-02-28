const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const protectDB = require('../../protect-config');
const { owners } = require('../../config');

const PROTECTION_TYPES = {
  all:     '🛡️ كل الحماية',
  ban:     '🔨 باند جماعي',
  kick:    '👢 كيك جماعي',
  channel: '📁 رومات (إنشاء/حذف/تعديل)',
  role:    '🎭 رتب (إنشاء/حذف/تعديل)',
  server:  '⚙️ تعديل السيرفر',
  webhook: '🔗 ويب هوك',
  bots:    '🤖 إضافة بوتات',
};

const TYPE_CHOICES = [
  { name: '🛡️ all — كل الحماية',       value: 'all'     },
  { name: '🔨 ban — باند جماعي',         value: 'ban'     },
  { name: '👢 kick — كيك جماعي',         value: 'kick'    },
  { name: '📁 channel — رومات',          value: 'channel' },
  { name: '🎭 role — رتب',               value: 'role'    },
  { name: '⚙️ server — تعديل السيرفر',  value: 'server'  },
  { name: '🔗 webhook — ويب هوك',        value: 'webhook' },
  { name: '🤖 bots — إضافة بوتات',      value: 'bots'    },
];

function isAuthorized(interaction) {
  const botOwners = Array.isArray(owners) ? owners : [owners];
  return botOwners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
}

module.exports = {
  ownersOnly: false,
  adminsOnly: false,
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('🛡️ إدارة الوايت ليست لنظام الحماية')
    .addSubcommand(sub =>
      sub.setName('add-user')
        .setDescription('✅ إضافة عضو أو بوت بالـ ID')
        .addStringOption(opt => opt.setName('id').setDescription('ID العضو أو البوت').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('نوع الحماية').setRequired(true).addChoices(...TYPE_CHOICES))
    )
    .addSubcommand(sub =>
      sub.setName('add-role')
        .setDescription('✅ إضافة رتبة كاملة للوايت ليست')
        .addRoleOption(opt => opt.setName('role').setDescription('الرتبة').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('نوع الحماية').setRequired(true).addChoices(...TYPE_CHOICES))
    )
    .addSubcommand(sub =>
      sub.setName('remove-user')
        .setDescription('❌ إزالة عضو أو بوت من الوايت ليست')
        .addStringOption(opt => opt.setName('id').setDescription('ID العضو أو البوت').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('نوع الحماية (فارغ = إزالة الكل)').setRequired(false).addChoices(...TYPE_CHOICES))
    )
    .addSubcommand(sub =>
      sub.setName('remove-role')
        .setDescription('❌ إزالة رتبة من الوايت ليست')
        .addRoleOption(opt => opt.setName('role').setDescription('الرتبة').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('نوع الحماية (فارغ = إزالة الكل)').setRequired(false).addChoices(...TYPE_CHOICES))
    )
    .addSubcommand(sub => sub.setName('list').setDescription('📋 عرض قائمة الوايت ليست'))
    .addSubcommand(sub => sub.setName('clear').setDescription('🗑️ مسح الوايت ليست كاملاً')),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#ED4245').setDescription('❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!')],
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    const sub     = interaction.options.getSubcommand();

    const getWL      = () => protectDB.get(`whitelist_v2_${guildId}`)   || {};
    const getRoleWL  = () => protectDB.get(`whitelist_roles_${guildId}`) || {};
    const saveWL     = v  => protectDB.set(`whitelist_v2_${guildId}`, v);
    const saveRoleWL = v  => protectDB.set(`whitelist_roles_${guildId}`, v);

    const addType = (obj, key, type) => {
      if (!obj[key]) obj[key] = [];
      if (type === 'all') { obj[key] = ['all']; return 'added_all'; }
      if (obj[key].includes('all')) return 'has_all';
      if (obj[key].includes(type)) return 'exists';
      obj[key].push(type);
      return 'ok';
    };

    const removeType = (obj, key, type) => {
      if (!obj[key]) return 'not_found';
      if (!type || type === 'all') { delete obj[key]; return 'removed_all'; }
      if (!obj[key].includes(type) && !obj[key].includes('all')) return 'not_found';
      obj[key] = obj[key].filter(t => t !== type && t !== 'all');
      if (obj[key].length === 0) delete obj[key];
      return 'ok';
    };

    // ─── add-user ───
    if (sub === 'add-user') {
      const targetId = interaction.options.getString('id').trim();
      const type     = interaction.options.getString('type');
      if (!/^\d{17,20}$/.test(targetId))
        return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ED4245').setDescription('❌ الـ ID غير صحيح!')], ephemeral: true });
      let name = targetId, isBot = false;
      try { const u = await interaction.client.users.fetch(targetId); name = u.username; isBot = u.bot; } catch {}
      const wl = getWL();
      const r  = addType(wl, targetId, type);
      saveWL(wl);
      if (r === 'has_all') return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${name}\` عنده \`all\` بالفعل`)], ephemeral: true });
      if (r === 'exists')  return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${name}\` عنده \`${type}\` بالفعل`)], ephemeral: true });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('#57F287').setTitle('✅ تمت الإضافة')
        .addFields(
          { name: isBot ? '🤖 البوت' : '👤 العضو', value: `**${name}**\n\`${targetId}\``, inline: true },
          { name: '🛡️ الحماية', value: `\`${type}\` — ${PROTECTION_TYPES[type]}`, inline: true },
          { name: '📋 كل الحمايات', value: wl[targetId].map(t => `\`${t}\``).join(', '), inline: false },
        ).setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }

    // ─── add-role ───
    if (sub === 'add-role') {
      const role = interaction.options.getRole('role');
      const type = interaction.options.getString('type');
      const rwl  = getRoleWL();
      const r    = addType(rwl, role.id, type);
      saveRoleWL(rwl);
      if (r === 'has_all') return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** عندها \`all\` بالفعل`)], ephemeral: true });
      if (r === 'exists')  return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** عندها \`${type}\` بالفعل`)], ephemeral: true });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('#57F287').setTitle('✅ تمت إضافة الرتبة')
        .setDescription(`كل أعضاء ${role} محميون تلقائياً 🛡️`)
        .addFields(
          { name: '🎭 الرتبة', value: `**${role.name}**\n\`${role.id}\``, inline: true },
          { name: '🛡️ الحماية', value: `\`${type}\` — ${PROTECTION_TYPES[type]}`, inline: true },
          { name: '📋 كل الحمايات', value: rwl[role.id].map(t => `\`${t}\``).join(', '), inline: false },
          { name: '👥 الأعضاء', value: `\`${role.members.size}\` عضو`, inline: true },
        ).setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }

    // ─── remove-user ───
    if (sub === 'remove-user') {
      const targetId = interaction.options.getString('id').trim();
      const type     = interaction.options.getString('type');
      let name = targetId;
      try { const u = await interaction.client.users.fetch(targetId); name = u.username; } catch {}
      const wl = getWL();
      const r  = removeType(wl, targetId, type);
      saveWL(wl);
      if (r === 'not_found') return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${name}\` غير موجود في الوايت ليست`)], ephemeral: true });
      const rem = wl[targetId] ? wl[targetId].map(t => `\`${t}\``).join(', ') : '`لا شيء`';
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ED4245').setTitle(r === 'removed_all' ? '🗑️ إزالة كاملة' : '✅ تمت الإزالة')
        .addFields(
          { name: '👤 العضو/البوت', value: `**${name}**\n\`${targetId}\``, inline: true },
          { name: '❌ المُزال', value: type ? `\`${type}\`` : '`كل الحمايات`', inline: true },
          { name: '📋 المتبقي', value: rem, inline: false },
        ).setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }

    // ─── remove-role ───
    if (sub === 'remove-role') {
      const role = interaction.options.getRole('role');
      const type = interaction.options.getString('type');
      const rwl  = getRoleWL();
      const r    = removeType(rwl, role.id, type);
      saveRoleWL(rwl);
      if (r === 'not_found') return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** غير موجودة في الوايت ليست`)], ephemeral: true });
      const rem = rwl[role.id] ? rwl[role.id].map(t => `\`${t}\``).join(', ') : '`لا شيء`';
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ED4245').setTitle('✅ تمت إزالة الرتبة')
        .addFields(
          { name: '🎭 الرتبة', value: `**${role.name}**`, inline: true },
          { name: '❌ المُزال', value: type ? `\`${type}\`` : '`كل الحمايات`', inline: true },
          { name: '📋 المتبقي', value: rem, inline: false },
        ).setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }

    // ─── list ───
    if (sub === 'list') {
      const wl  = getWL();
      const rwl = getRoleWL();
      const uE  = Object.entries(wl);
      const rE  = Object.entries(rwl);
      if (uE.length === 0 && rE.length === 0)
        return interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('📋 الوايت ليست فارغة').setDescription('استخدم `/whitelist add-user` أو `/whitelist add-role`')], ephemeral: true });
      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📋 قائمة الوايت ليست').setTimestamp();
      if (uE.length > 0) {
        const lines = [];
        for (const [id, types] of uE) {
          let name = id, badge = '👤';
          try { const u = await interaction.client.users.fetch(id); name = u.username; if (u.bot) badge = '🤖'; } catch {}
          lines.push(`${badge} **${name}** \`${id}\`\n╰ ${types.map(t => `\`${t}\``).join(', ')}`);
        }
        embed.addFields({ name: `👥 أعضاء وبوتات (${uE.length})`, value: lines.join('\n\n').slice(0, 1020), inline: false });
      }
      if (rE.length > 0) {
        const lines = [];
        for (const [id, types] of rE) {
          const r = interaction.guild.roles.cache.get(id);
          lines.push(`🎭 **${r ? r.name : id}** \`${id}\`\n╰ ${types.map(t => `\`${t}\``).join(', ')}`);
        }
        embed.addFields({ name: `🎭 رتب (${rE.length})`, value: lines.join('\n\n').slice(0, 1020), inline: false });
      }
      embed.addFields({ name: '🔒 محميون تلقائياً', value: 'صاحب السيرفر + البوت', inline: true });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ─── clear ───
    if (sub === 'clear') {
      const wl  = getWL();
      const rwl = getRoleWL();
      const uC  = Object.keys(wl).length;
      const rC  = Object.keys(rwl).length;
      if (uC === 0 && rC === 0)
        return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription('⚠️ الوايت ليست فارغة أصلاً')], ephemeral: true });
      saveWL({});
      saveRoleWL({});
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ED4245').setTitle('🗑️ تم المسح الكامل')
        .setDescription(`حُذف **${uC}** عضو/بوت و **${rC}** رتبة`)
        .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }
  }
};
