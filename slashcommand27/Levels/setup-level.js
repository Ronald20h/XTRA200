const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { SimpleDB } = require('../../db-manager');

const systemDB = new SimpleDB('./Json-db/Bots/systemDB.json');

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('setup-level')
    .setDescription('⭐ إعداد نظام المستويات')
    .addSubcommand(sub =>
      sub.setName('enable')
        .setDescription('✅ تفعيل نظام المستويات')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('روم إشعارات الترقي (اتركه فارغاً للرد في نفس الروم)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('❌ تعطيل نظام المستويات')
    )
    .addSubcommand(sub =>
      sub.setName('info')
        .setDescription('📊 عرض إعدادات نظام المستويات')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'enable') {
      const channel = interaction.options.getChannel('channel');

      systemDB.set(`level_enabled_${guildId}`, true);
      if (channel) systemDB.set(`level_channel_${guildId}`, channel.id);
      else systemDB.delete(`level_channel_${guildId}`);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ تم تفعيل نظام المستويات')
        .addFields(
          { name: '📌 روم الإشعارات', value: channel ? `${channel}` : '`نفس روم الرسالة`', inline: true },
          { name: '💬 كيف يشتغل؟', value: 'كل رسالة تُحسب — كلما أرسل العضو أكثر كلما ارتقى مستواه!', inline: false },
          { name: '⏱️ الكولداون', value: 'رسالة واحدة كل دقيقة تُحسب (لمنع السبام)', inline: false },
        )
        .setFooter({ text: `تم الإعداد بواسطة ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'disable') {
      const enabled = systemDB.get(`level_enabled_${guildId}`);
      if (!enabled) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#FEE75C')
            .setDescription('⚠️ نظام المستويات غير مفعل أصلاً')
          ],
          ephemeral: true
        });
      }
      systemDB.set(`level_enabled_${guildId}`, false);
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ تم تعطيل نظام المستويات')
          .setDescription('يمكنك تفعيله مجدداً بـ `/setup-level enable`')
          .setTimestamp()
        ]
      });
    }

    if (sub === 'info') {
      const enabled = systemDB.get(`level_enabled_${guildId}`);
      const channelId = systemDB.get(`level_channel_${guildId}`);
      const channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;

      const embed = new EmbedBuilder()
        .setColor(enabled ? '#57F287' : '#ED4245')
        .setTitle('📊 حالة نظام المستويات')
        .addFields(
          { name: '🔋 الحالة', value: enabled ? '✅ مفعّل' : '❌ معطّل', inline: true },
          { name: '📌 روم الإشعارات', value: channel ? `${channel}` : '`نفس روم الرسالة`', inline: true },
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
