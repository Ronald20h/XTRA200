const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db");
const ticketDB = new Database('./Json-db/Bots/ticketDB.json');

module.exports = {
    ownersOnly: false,
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('إعداد نظام التكت في السيرفر')
        .addChannelOption(o => 
            o.setName('channel')
                .setDescription('الروم الذي سيتم إرسال رسالة التكت فيه')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .addRoleOption(o =>
            o.setName('support-role')
                .setDescription('رتبة الدعم التي ستتمكن من رؤية التكتات')
                .setRequired(true))
        .addChannelOption(o =>
            o.setName('category')
                .setDescription('الفئة التي سيتم إنشاء التكتات فيها')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildCategory))
        .addStringOption(o =>
            o.setName('title')
                .setDescription('عنوان رسالة التكت (افتراضي: 📩 نظام التكت)')
                .setRequired(false))
        .addStringOption(o =>
            o.setName('description')
                .setDescription('وصف رسالة التكت')
                .setRequired(false))
        .addStringOption(o =>
            o.setName('button-text')
                .setDescription('نص الزر (افتراضي: 🎫 فتح تكت)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const channel = interaction.options.getChannel('channel');
            const supportRole = interaction.options.getRole('support-role');
            const category = interaction.options.getChannel('category');
            const title = interaction.options.getString('title') || '📩 نظام التكت';
            const description = interaction.options.getString('description') || 
                'اضغط على الزر أدناه لفتح تكت جديد.\nسيتم الرد عليك في أقرب وقت ممكن.';
            const buttonText = interaction.options.getString('button-text') || '🎫 فتح تكت';

            // Save settings
            ticketDB.set(`TicketSettings_${interaction.guild.id}`, {
                channelId: channel.id,
                supportRoleId: supportRole.id,
                categoryId: category?.id || null,
                createdBy: interaction.user.id,
                createdAt: Date.now()
            });

            // Create embed
            const ticketEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(title)
                .setDescription(description)
                .addFields(
                    { name: '📝 كيفية الاستخدام', value: 'اضغط على الزر أدناه لفتح تكت جديد', inline: false },
                    { name: '⏰ وقت الرد', value: 'سيتم الرد عليك في أقرب وقت ممكن', inline: true },
                    { name: '👥 رتبة الدعم', value: `${supportRole}`, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Made by STEVEN' })
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel(buttonText)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

            await channel.send({ embeds: [ticketEmbed], components: [button] });

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ تم إعداد نظام التكت بنجاح!')
                .setDescription(`تم إرسال رسالة التكت في ${channel}`)
                .addFields(
                    { name: '📺 الروم', value: `${channel}`, inline: true },
                    { name: '🎭 رتبة الدعم', value: `${supportRole}`, inline: true },
                    { name: '📁 الفئة', value: category ? `${category}` : '`لا يوجد`', inline: true }
                )
                .setFooter({ text: 'Made by STEVEN' })
                .setTimestamp();

            return interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('[setup-ticket]', error);
            return interaction.editReply({ content: '❌ حدث خطأ أثناء إعداد نظام التكت.' });
        }
    }
}
