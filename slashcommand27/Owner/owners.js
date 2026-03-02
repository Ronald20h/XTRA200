const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { owners } = require('../../config');

module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('owners')
        .setDescription('عرض قائمة أصحاب البوت'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const client = interaction.client;
            
            // Fetch all owner users
            const ownersList = [];
            for (const ownerId of owners) {
                try {
                    const user = await client.users.fetch(ownerId);
                    ownersList.push({
                        user,
                        id: ownerId
                    });
                } catch {
                    ownersList.push({
                        user: null,
                        id: ownerId
                    });
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('👑 أصحاب البوت')
                .setDescription(`**عدد الأونرز:** \`${owners.length}\``)
                .setThumbnail(client.user.displayAvatarURL({ size: 256, dynamic: true }))
                .setFooter({ text: 'Made by king & STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            ownersList.forEach((owner, index) => {
                embed.addFields({
                    name: `${index + 1}. ${owner.user ? owner.user.username : 'Unknown User'}`,
                    value: owner.user 
                        ? `${owner.user}\nID: \`${owner.id}\``
                        : `ID: \`${owner.id}\`\n*(لم يتم العثور على المستخدم)*`,
                    inline: false
                });
            });

            embed.addFields({
                name: '\u200B',
                value: '⚙️ **لتحديث القائمة:**\nقم بتعديل ملف `config.js`',
                inline: false
            });

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[owners]', error);
            return interaction.editReply({
                content: '❌ حدث خطأ أثناء عرض القائمة.',
            });
        }
    }
}
