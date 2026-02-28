const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('قائمة أوامر البوت'),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });
            const { prefix } = require('../../config');

            const embed = new EmbedBuilder()
                .setTitle('📋 قائمة أوامر البوت')
                .setDescription(
                    `**يرجى اختيار القسم المراد معرفة أوامره**\n\n` +
                    `[🔗 إضافة البوت](https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands) • ` +
                    `[💬 سيرفر الدعم](https://discord.gg/HC8V8cPF4)`
                )
                .addFields({ name: '\u200B', value: '```⚡ | 99 أمر```' })
                .setColor('DarkButNotBlack')
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Made by king, STEVEN & ZAK`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            // صف 1: الأساسيات
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_general').setLabel('عام').setStyle(ButtonStyle.Secondary).setEmoji('🌐'),
                new ButtonBuilder().setCustomId('help_system').setLabel('سيستم').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                new ButtonBuilder().setCustomId('help_prefix').setLabel('بريفكس').setStyle(ButtonStyle.Secondary).setEmoji('⚡'),
                new ButtonBuilder().setCustomId('help_protection').setLabel('حماية').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                new ButtonBuilder().setCustomId('help_ticket').setLabel('تكت').setStyle(ButtonStyle.Secondary).setEmoji('🎫'),
            );

            // صف 2: الأنظمة
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_logs').setLabel('لوج').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
                new ButtonBuilder().setCustomId('help_apply').setLabel('تقديمات').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                new ButtonBuilder().setCustomId('help_autoreply').setLabel('رد تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('💬'),
                new ButtonBuilder().setCustomId('help_autorole').setLabel('رتب تلقائية').setStyle(ButtonStyle.Secondary).setEmoji('🎭'),
                new ButtonBuilder().setCustomId('help_broadcast').setLabel('برودكاست').setStyle(ButtonStyle.Secondary).setEmoji('📢'),
            );

            // صف 3: المميزات
            const row3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_azkar').setLabel('أذكار').setStyle(ButtonStyle.Secondary).setEmoji('📿'),
                new ButtonBuilder().setCustomId('help_tax').setLabel('ضريبة').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
                new ButtonBuilder().setCustomId('help_autoline').setLabel('خط تلقائي').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                new ButtonBuilder().setCustomId('help_suggestion').setLabel('اقتراحات').setStyle(ButtonStyle.Secondary).setEmoji('💡'),
                new ButtonBuilder().setCustomId('help_feedback').setLabel('آراء').setStyle(ButtonStyle.Secondary).setEmoji('💭'),
            );

            // صف 4: المتقدم + معلومات
            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_ai').setLabel('AI').setStyle(ButtonStyle.Primary).setEmoji('🤖'),
                new ButtonBuilder().setCustomId('help_autoemoji').setLabel('ايموجي').setStyle(ButtonStyle.Secondary).setEmoji('🎭'),
                new ButtonBuilder().setCustomId('help_tokens').setLabel('توكنات').setStyle(ButtonStyle.Danger).setEmoji('🔍'),
                new ButtonBuilder().setCustomId('help_owners').setLabel('الأونرز').setStyle(ButtonStyle.Secondary).setEmoji('👑'),
                new ButtonBuilder().setCustomId('help_developers').setLabel('المطورون').setStyle(ButtonStyle.Secondary).setEmoji('👨‍💻'),
            );

            await interaction.editReply({ embeds: [embed], components: [row1, row2, row3, row4] });

        } catch (error) {
            console.log("🔴 | Error in help command", error);
        }
    }
}
