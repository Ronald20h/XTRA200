const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { aiDB } = require('../../handlers/ai-system');
const { groqApiKey } = require('../../config');

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('setup-ai')
    .setDescription('🤖 إعداد نظام الذكاء الاصطناعي للسيرفر')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('✅ تفعيل وإعداد الذكاء الاصطناعي')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('الروم الذي سيرد فيه البوت')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('model')
            .setDescription('الموديل المستخدم (اختياري)')
            .setRequired(false)
            .addChoices(
              { name: 'llama-3.1-8b-instant (الافتراضي - أسرع)', value: 'llama-3.1-8b-instant' },
              { name: 'llama-3.3-70b-versatile (أذكى)', value: 'llama-3.3-70b-versatile' },
              { name: 'gemma2-9b-it', value: 'gemma2-9b-it' },
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('❌ تعطيل الذكاء الاصطناعي')
    )
    .addSubcommand(sub =>
      sub.setName('info')
        .setDescription('📊 عرض إعدادات الذكاء الاصطناعي الحالية')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // ===== تفعيل وإعداد =====
    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      const model = interaction.options.getString('model') || 'llama-3.1-8b-instant';

      // تحقق أن الـ API Key موجود في الكونفيج
      if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY' || groqApiKey === '') {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('❌ الـ API Key غير مضبوط')
            .setDescription(
              'مالك البوت لم يضع **GROQ_API_KEY** في ملف `.env` بعد!\n\n' +
              '**للمالك:**\n```\nGROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx\n```\n' +
              'احصل على Key مجاني من [console.groq.com](https://console.groq.com)'
            )
          ],
          ephemeral: true
        });
      }

      // حفظ الإعدادات بدون API Key (يُستخدم الافتراضي من الكونفيج)
      aiDB.set(guildId, {
        enabled: true,
        channelId: channel.id,
        model: model,
        setBy: interaction.user.id,
        setAt: Date.now()
      });

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ تم تفعيل الذكاء الاصطناعي')
        .addFields(
          { name: '📌 الروم', value: `${channel}`, inline: true },
          { name: '🧠 الموديل', value: `\`${model}\``, inline: true },
          { name: '🔑 الـ API Key', value: '`يستخدم Key البوت التلقائي ✅`', inline: true },
          { name: '💡 كيف يشتغل؟', value: 'أرسل أي رسالة في الروم المحدد وسيرد عليك البوت بالذكاء الاصطناعي', inline: false },
        )
        .setFooter({ text: `تم الإعداد بواسطة ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ===== تعطيل =====
    if (sub === 'disable') {
      const current = aiDB.get(guildId);
      if (!current || !current.enabled) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#FEE75C')
            .setDescription('⚠️ الذكاء الاصطناعي غير مفعل في هذا السيرفر أصلاً')
          ],
          ephemeral: true
        });
      }

      aiDB.set(guildId, { ...current, enabled: false });

      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('❌ تم تعطيل الذكاء الاصطناعي')
          .setDescription('يمكنك تفعيله مجدداً بـ `/setup-ai set`')
          .setTimestamp()
        ]
      });
    }

    // ===== معلومات =====
    if (sub === 'info') {
      const settings = aiDB.get(guildId);

      if (!settings) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📊 حالة الذكاء الاصطناعي')
            .setDescription('❌ لم يتم إعداد الذكاء الاصطناعي بعد\n\nاستخدم `/setup-ai set` للإعداد')
          ],
          ephemeral: true
        });
      }

      const channel = interaction.guild.channels.cache.get(settings.channelId);
      const setByUser = await interaction.client.users.fetch(settings.setBy).catch(() => null);

      const apiStatus = groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY' && groqApiKey !== ''
        ? '✅ Key البوت التلقائي جاهز'
        : '❌ لم يُضبط بعد';

      const embed = new EmbedBuilder()
        .setColor(settings.enabled ? '#57F287' : '#ED4245')
        .setTitle('📊 حالة الذكاء الاصطناعي')
        .addFields(
          { name: '🔋 الحالة', value: settings.enabled ? '✅ مفعّل' : '❌ معطّل', inline: true },
          { name: '📌 الروم', value: channel ? `${channel}` : '`تم حذف الروم`', inline: true },
          { name: '🧠 الموديل', value: `\`${settings.model || 'llama-3.1-8b-instant'}\``, inline: true },
          { name: '🔑 الـ API Key', value: apiStatus, inline: true },
          { name: '👤 أُعِدَّ بواسطة', value: setByUser ? `${setByUser.tag}` : `\`${settings.setBy}\``, inline: true },
          { name: '📅 تاريخ الإعداد', value: settings.setAt ? `<t:${Math.floor(settings.setAt / 1000)}:R>` : 'غير معروف', inline: true },
        )
        .setFooter({ text: '🤖 Xtra AI • Groq' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
