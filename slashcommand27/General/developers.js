const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { developers } = require('../../config');
const path = require('path');

module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('developers')
        .setDescription('عرض معلومات مطوري البوت'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const client = interaction.client;

            // تحميل الصور كـ attachments
            const zakAttachment = new AttachmentBuilder(path.join(__dirname, '../../public/zak.png'), { name: 'zak.png' });
            const stevenAttachment = new AttachmentBuilder(path.join(__dirname, '../../public/steven.jpg'), { name: 'steven.jpg' });

            // Fetch المستخدمين
            let stevenUser = null, zakUser = null, kingUser = null;
            try { kingUser = await client.users.fetch(developers.king.id); } catch {}
            try { stevenUser = await client.users.fetch(developers.steven.id); } catch {}
            try { zakUser = await client.users.fetch(developers.zak.id); } catch {}

            // Embed Steven
            const stevenEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('⚡ Steven')
                .setDescription('**مبرمج في البوت**')
                .setImage('attachment://steven.jpg')
                .addFields(
                    { name: '👤 الاسم', value: `**${developers.steven.name}**`, inline: true },
                    { name: '🏷️ الرتبة', value: '`Co-Developer`', inline: true },
                    { name: '🔗 منشن', value: stevenUser ? `${stevenUser}` : `\`${developers.steven.id}\``, inline: true },
                )
                .setFooter({ text: 'Made with ❤️ by king, STEVEN & ZAK' });

            // Embed Zak
            const zakEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🔧 Zak')
                .setDescription('**مبرمج في البوت**')
                .setImage('attachment://zak.png')
                .addFields(
                    { name: '👤 الاسم', value: `**${developers.zak.name}**`, inline: true },
                    { name: '🏷️ الرتبة', value: '`Developer`', inline: true },
                    { name: '🔗 منشن', value: zakUser ? `${zakUser}` : `\`${developers.zak.id}\``, inline: true },
                )
                .setFooter({ text: 'Made with ❤️ by king, STEVEN & ZAK' });

            // زر سيرفر الدعم
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 سيرفر الدعم')
                    .setURL('https://discord.gg/HC8V8cPF4')
                    .setStyle(ButtonStyle.Link)
            );

            return interaction.editReply({
                embeds: [stevenEmbed, zakEmbed],
                files: [stevenAttachment, zakAttachment],
                components: [row]
            });

        } catch (error) {
            console.error('[developers]', error);
            return interaction.editReply({ content: '❌ حدث خطأ أثناء عرض المعلومات.' });
        }
    }
}
