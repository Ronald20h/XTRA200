const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { owners } = require('../../config');

module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('لوحة التحكم الشاملة للبوت'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const isOwner = owners.includes(interaction.user.id);
            const isAdmin = interaction.member.permissions.has('Administrator');

            const mainEmbed = new EmbedBuilder()
                .setColor('#00D9FF')
                .setTitle('🎛️ لوحة التحكم الرئيسية')
                .setDescription([
                    '**مرحباً بك في لوحة التحكم الشاملة!**\n',
                    `👤 **المستخدم:** ${interaction.user}`,
                    `🎭 **الصلاحيات:** ${isOwner ? '👑 Owner' : isAdmin ? '⚡ Admin' : '👥 Member'}`,
                    `🌐 **السيرفر:** ${interaction.guild.name}\n`,
                    '📋 **اختر القسم:**'
                ].join('\n'))
                .addFields(
                    { name: '🛡️ الحماية', value: 'حماية السيرفر', inline: true },
                    { name: '🎫 التكت', value: 'نظام التذاكر', inline: true },
                    { name: '📋 اللوج', value: 'سجلات الأحداث', inline: true },
                    { name: '📢 البرودكاست', value: 'رسائل جماعية', inline: true },
                    { name: '⚙️ الإعدادات', value: 'إعدادات البوت', inline: true },
                    { name: '📊 الإحصائيات', value: 'إحصائيات', inline: true },
                    { name: '🌐 اللغة', value: 'تغيير اللغة', inline: true },
                    { name: '⚡ البريفكس', value: 'إعدادات البريفكس', inline: true },
                    { name: '👑 Owner', value: isOwner ? 'متاح لك' : 'للأونر فقط', inline: true },
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Made by king & STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            // صف 1: الأنظمة الرئيسية (5 أزرار)
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_protection').setLabel('🛡️ الحماية').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_ticket').setLabel('🎫 التكت').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_logs').setLabel('📋 اللوج').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_broadcast').setLabel('📢 برودكاست').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_settings').setLabel('⚙️ إعدادات').setStyle(ButtonStyle.Secondary),
            );

            // صف 2: باقي الأنظمة (5 أزرار)
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_stats').setLabel('📊 إحصائيات').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('panel_language').setLabel('🌐 اللغة').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('panel_prefix').setLabel('⚡ البريفكس').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('panel_owner').setLabel('👑 Owner').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setLabel('🌐 الدعم').setStyle(ButtonStyle.Link).setURL('https://discord.gg/HC8V8cPF4'),
            );

            await interaction.editReply({ embeds: [mainEmbed], components: [row1, row2] });

        } catch (error) {
            console.error('[dashboard]', error);
            return interaction.editReply({ content: '❌ حدث خطأ أثناء فتح لوحة التحكم.' });
        }
    }
}
