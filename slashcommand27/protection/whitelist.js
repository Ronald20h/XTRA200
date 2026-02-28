const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

function isAuthorized(interaction) {
  const botOwners = Array.isArray(owners) ? owners : [owners];
  return botOwners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
}

const TYPE_CHOICES = [
  { name: '🛡️ all — كل الحماية',        value: 'all'     },
  { name: '🔨 ban — باند جماعي',          value: 'ban'     },
  { name: '👢 kick — كيك جماعي',          value: 'kick'    },
  { name: '📁 channel — رومات',           value: 'channel' },
  { name: '🎭 role — رتب',                value: 'role'    },
  { name: '⚙️ server — تعديل السيرفر',   value: 'server'  },
  { name: '🔗 webhook — ويب هوك',         value: 'webhook' },
  { name: '🤖 bots — إضافة بوتات',       value: 'bots'    },
];

module.exports = {
  ownersOnly: false,
  adminsOnly: false,
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('🛡️ إدارة الوايت ليست لنظام الحماية')

    // ===== add user =====
    .addSubcommandGroup(group =>
      group.setName('add').setDescription('✅ إضافة للوايت ليست')
        .addSubcommand(sub =>
          sub.setName('user')
            .setDescription('✅ إضافة عضو أو بوت بالـ ID')
            .addStringOption(opt =>
              opt.setName('id').setDescription('ID العضو أو البوت').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('type').setDescription('نوع الحماية').setRequired(true)
                .addChoices(...TYPE_CHOICES)
            )
        )
        .addSubcommand(sub =>
          sub.setName('role')
            .setDescription('✅ إضافة رتبة كاملة للوايت ليست')
            .addRoleOption(opt =>
              opt.setName('role').setDescription('الرتبة').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('type').setDescription('نوع الحماية').setRequired(true)
                .addChoices(...TYPE_CHOICES)
            )
        )
    )

    // ===== remove =====
    .addSubcommandGroup(group =>
      group.setName('remove').setDescription('❌ إزالة من الوايت ليست')
        .addSubcommand(sub =>
          sub.setName('user')
            .setDescription('❌ إزالة عضو أو بوت')
            .addStringOption(opt =>
              opt.setName('id').setDescription('ID العضو أو البوت').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('type').setDescription('نوع الحماية (اتركه لإزالة الكل)').setRequired(false)
                .addChoices(...TYPE_CHOICES)
            )
        )
        .addSubcommand(sub =>
          sub.setName('role')
            .setDescription('❌ إزالة رتبة من الوايت ليست')
            .addRoleOption(opt =>
              opt.setName('role').setDescription('الرتبة').setRequired(true)
            )
            .addStringOption(opt =>
              opt.setName('type').setDescription('نوع الحماية (اتركه لإزالة الكل)').setRequired(false)
                .addChoices(...TYPE_CHOICES)
            )
        )
    )

    // ===== list / clear =====
    .addSubcommand(sub =>
      sub.setName('list').setDescription('📋 عرض قائمة الوايت ليست (أعضاء + رتب)')
    )
    .addSubcommand(sub =>
      sub.setName('clear').setDescription('🗑️ مسح الوايت ليست كاملاً')
    ),

  async execute(interaction) {
    if (!isAuthorized(interaction)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#ED4245').setDescription('❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!')],
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    const group   = interaction.options.getSubcommandGroup(false);
    const sub     = interaction.options.getSubcommand();

    // helpers
    const getWL      = () => protectDB.get(`whitelist_v2_${guildId}`)    || {};
    const getRoleWL  = () => protectDB.get(`whitelist_roles_${guildId}`)  || {};
    const saveWL     = (v) => protectDB.set(`whitelist_v2_${guildId}`, v);
    const saveRoleWL = (v) => protectDB.set(`whitelist_roles_${guildId}`, v);

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

    // ===================== ADD =====================
    if (group === 'add') {

      // --- add user ---
      if (sub === 'user') {
        const targetId = interaction.options.getString('id').trim();
        const type     = interaction.options.getString('type');

        if (!/^\d{17,20}$/.test(targetId))
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#ED4245').setDescription('❌ الـ ID غير صحيح!')], ephemeral: true });

        let targetName = targetId, isBot = false;
        try { const u = await interaction.client.users.fetch(targetId); targetName = u.username; isBot = u.bot; } catch {}

        const wl = getWL();
        const result = addType(wl, targetId, type);
        saveWL(wl);

        if (result === 'has_all')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${targetName}\` عنده \`all\` بالفعل`)], ephemeral: true });
        if (result === 'exists')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${targetName}\` عنده \`${type}\` بالفعل`)], ephemeral: true });

        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ تمت الإضافة')
          .addFields(
            { name: isBot ? '🤖 البوت' : '👤 العضو', value: `**${targetName}** \`${targetId}\``, inline: true },
            { name: '🛡️ الحماية', value: `\`${type}\` — ${PROTECTION_TYPES[type]}`, inline: true },
            { name: '📋 كل الحمايات', value: wl[targetId].map(t=>`\`${t}\``).join(', '), inline: false },
          )
          .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
        ]});
      }

      // --- add role ---
      if (sub === 'role') {
        const role = interaction.options.getRole('role');
        const type = interaction.options.getString('type');

        const rwl    = getRoleWL();
        const result = addType(rwl, role.id, type);
        saveRoleWL(rwl);

        if (result === 'has_all')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** عندها \`all\` بالفعل`)], ephemeral: true });
        if (result === 'exists')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** عندها \`${type}\` بالفعل`)], ephemeral: true });

        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('✅ تمت إضافة الرتبة')
          .setDescription(`كل أعضاء الرتبة ${role} سيكونون محميين تلقائياً`)
          .addFields(
            { name: '🎭 الرتبة', value: `**${role.name}** \`${role.id}\``, inline: true },
            { name: '🛡️ الحماية', value: `\`${type}\` — ${PROTECTION_TYPES[type]}`, inline: true },
            { name: '📋 كل الحمايات', value: rwl[role.id].map(t=>`\`${t}\``).join(', '), inline: false },
            { name: '👥 عدد الأعضاء الحاليين', value: `\`${role.members.size}\` عضو`, inline: true },
          )
          .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
        ]});
      }
    }

    // ===================== REMOVE =====================
    if (group === 'remove') {

      // --- remove user ---
      if (sub === 'user') {
        const targetId = interaction.options.getString('id').trim();
        const type     = interaction.options.getString('type');

        let targetName = targetId;
        try { const u = await interaction.client.users.fetch(targetId); targetName = u.username; } catch {}

        const wl     = getWL();
        const result = removeType(wl, targetId, type);
        saveWL(wl);

        if (result === 'not_found')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ \`${targetName}\` غير موجود في الوايت ليست`)], ephemeral: true });

        const remaining = wl[targetId] ? wl[targetId].map(t=>`\`${t}\``).join(', ') : '`لا شيء`';
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle(result === 'removed_all' ? '🗑️ تمت الإزالة الكاملة' : '✅ تمت الإزالة')
          .addFields(
            { name: '👤 العضو/البوت', value: `\`${targetName}\``, inline: true },
            { name: '❌ المُزال', value: type ? `\`${type}\`` : '`كل الحمايات`', inline: true },
            { name: '📋 المتبقي', value: remaining, inline: false },
          )
          .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
        ]});
      }

      // --- remove role ---
      if (sub === 'role') {
        const role   = interaction.options.getRole('role');
        const type   = interaction.options.getString('type');
        const rwl    = getRoleWL();
        const result = removeType(rwl, role.id, type);
        saveRoleWL(rwl);

        if (result === 'not_found')
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription(`⚠️ رتبة **${role.name}** غير موجودة في الوايت ليست`)], ephemeral: true });

        const remaining = rwl[role.id] ? rwl[role.id].map(t=>`\`${t}\``).join(', ') : '`لا شيء`';
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('✅ تمت إزالة الرتبة')
          .addFields(
            { name: '🎭 الرتبة', value: `**${role.name}**`, inline: true },
            { name: '❌ المُزال', value: type ? `\`${type}\`` : '`كل الحمايات`', inline: true },
            { name: '📋 المتبقي', value: remaining, inline: false },
          )
          .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
        ]});
      }
    }

    // ===================== LIST =====================
    if (sub === 'list') {
      const wl  = getWL();
      const rwl = getRoleWL();
      const uEntries = Object.entries(wl);
      const rEntries = Object.entries(rwl);

      if (uEntries.length === 0 && rEntries.length === 0)
        return interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setTitle('📋 الوايت ليست فارغة').setDescription('استخدم `/whitelist add user` أو `/whitelist add role`')], ephemeral: true });

      const embed = new EmbedBuilder().setColor('#5865F2').setTitle('📋 قائمة الوايت ليست').setTimestamp();

      // أعضاء/بوتات
      if (uEntries.length > 0) {
        const lines = [];
        for (const [id, types] of uEntries) {
          let name = id, badge = '👤';
          try { const u = await interaction.client.users.fetch(id); name = u.username; if(u.bot) badge='🤖'; } catch {}
          lines.push(`${badge} **${name}** \`${id}\`\n╰ ${types.map(t=>`\`${t}\``).join(', ')}`);
        }
        embed.addFields({ name: `👥 أعضاء وبوتات (${uEntries.length})`, value: lines.join('\n\n').slice(0,1020), inline: false });
      }

      // رتب
      if (rEntries.length > 0) {
        const lines = [];
        for (const [id, types] of rEntries) {
          const r = interaction.guild.roles.cache.get(id);
          const name = r ? r.name : id;
          lines.push(`🎭 **${name}** \`${id}\`\n╰ ${types.map(t=>`\`${t}\``).join(', ')}`);
        }
        embed.addFields({ name: `🎭 رتب (${rEntries.length})`, value: lines.join('\n\n').slice(0,1020), inline: false });
      }

      embed.addFields({ name: '🔒 محميون تلقائياً', value: 'صاحب السيرفر + البوت', inline: true });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ===================== CLEAR =====================
    if (sub === 'clear') {
      const wl  = getWL();
      const rwl = getRoleWL();
      const total = Object.keys(wl).length + Object.keys(rwl).length;

      if (total === 0)
        return interaction.reply({ embeds: [new EmbedBuilder().setColor('#FEE75C').setDescription('⚠️ الوايت ليست فارغة أصلاً')], ephemeral: true });

      saveWL({});
      saveRoleWL({});
      return interaction.reply({ embeds: [new EmbedBuilder()
        .setColor('#ED4245').setTitle('🗑️ تم المسح الكامل')
        .setDescription(`تم حذف **${Object.keys(wl).length}** عضو/بوت و **${Object.keys(rwl).length}** رتبة`)
        .setFooter({ text: `بواسطة ${interaction.user.username}` }).setTimestamp()
      ]});
    }
  }
};
