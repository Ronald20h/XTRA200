const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { shortcutDB } = require('../../db-manager');

const ALL_CMDS = [
  'help','ping','server','user','avatar','tax','ban','unban','kick',
  'mute','unmute','clear','lock','unlock','hide','unhide','say','come',
  'rename','ticket-close','ticket-add','ticket-remove',
  'زخرفة','unban','حماية-تفعيل','حماية-تعطيل','حماية-حالة','بريفكس'
];

module.exports = {
  adminsOnly: false,
  data: new SlashCommandBuilder()
    .setName('shortcut')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('إدارة اختصارات أوامر البريفكس')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('إضافة اختصار لأمر بريفكس')
        .addStringOption(opt =>
          opt.setName('command')
            .setDescription('الأمر الأصلي (اكتب اسمه)')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(opt =>
          opt.setName('alias')
            .setDescription('الاختصار الجديد (بدون بريفكس)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('إزالة اختصار')
        .addStringOption(opt =>
          opt.setName('alias')
            .setDescription('الاختصار المراد إزالته')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('عرض كل الاختصارات في السيرفر')
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    const filtered = ALL_CMDS.filter(c => c.includes(focused)).slice(0, 25);
    await interaction.respond(filtered.map(c => ({ name: c, value: c })));
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const cmd = interaction.options.getString('command');
      const alias = interaction.options.getString('alias').toLowerCase().trim();
      if (!ALL_CMDS.includes(cmd)) {
        return interaction.editReply({ content: `❌ الأمر \`${cmd}\` غير موجود. الأوامر المتاحة: ${ALL_CMDS.join(', ')}` });
      }

      // تحقق أن الاختصار ما يكونش أمر أصلي
      // Check alias not same as existing command
      if (ALL_CMDS.includes(alias)) {
        return interaction.editReply({ content: `❌ الاختصار \`${alias}\` هو أمر أصلي، اختر اسم ثاني` });
      }

      // تحقق من طول الاختصار
      if (alias.length < 1 || alias.length > 20) {
        return interaction.editReply({ content: '❌ الاختصار يجب أن يكون بين 1 و 20 حرف' });
      }

      // البحث عن خانة فارغة (10 خانات لكل أمر)
      let saved = false;
      for (let i = 1; i <= 10; i++) {
        const key = `sc_${cmd}_${i}_${guildId}`;
        if (!shortcutDB.get(key)) {
          shortcutDB.set(key, alias);
          saved = true;
          break;
        }
      }

      if (!saved) {
        return interaction.editReply({ content: `❌ وصلت للحد الأقصى (10 اختصارات) للأمر \`${cmd}\`` });
      }

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ تم إضافة الاختصار')
        .addFields(
          { name: '⚡ الاختصار', value: `\`${alias}\``, inline: true },
          { name: '🎯 يشغّل أمر', value: `\`${cmd}\``, inline: true },
          { name: '📖 طريقة الاستخدام', value: `استخدم البريفكس + \`${alias}\` بدل \`${cmd}\``, inline: false }
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const alias = interaction.options.getString('alias').toLowerCase().trim();
      let removed = false;

      for (const cmd of ALL_CMDS) {
        for (let i = 1; i <= 10; i++) {
          const key = `sc_${cmd}_${i}_${guildId}`;
          if (shortcutDB.get(key) === alias) {
            shortcutDB.delete(key);
            removed = true;
            break;
          }
        }
        if (removed) break;
      }

      if (!removed) {
        return interaction.editReply({ content: `❌ الاختصار \`${alias}\` غير موجود` });
      }

      return interaction.editReply({ content: `✅ تم إزالة الاختصار \`${alias}\`` });
    }

    if (sub === 'list') {
      const allShortcuts = [];
      for (const cmd of ALL_CMDS) {
        for (let i = 1; i <= 10; i++) {
          const key = `sc_${cmd}_${i}_${guildId}`;
          const alias = shortcutDB.get(key);
          if (alias) allShortcuts.push({ cmd, alias });
        }
      }

      if (allShortcuts.length === 0) {
        return interaction.editReply({ content: '📋 لا يوجد اختصارات مضافة في هذا السيرفر' });
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('⚡ اختصارات البريفكس')
        .setDescription(
          allShortcuts.map(s => `\`${s.alias}\` ← **${s.cmd}**`).join('\n')
        )
        .setFooter({ text: `${allShortcuts.length} اختصار | ${interaction.guild.name}` })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }
  }
};
