const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('emoji-list')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('عرض الإيموجيات المحفوظة في السيرفر'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const emojis = interaction.guild.emojis.cache;

        if (emojis.size === 0) {
            return interaction.editReply({ content: '❌ لا توجد إيموجيات في السيرفر!' });
        }

        const staticEmojis = emojis.filter(e => !e.animated);
        const animatedEmojis = emojis.filter(e => e.animated);

        let desc = `**إجمالي الإيموجيات:** \`${emojis.size}\`\n`;
        desc += `🖼️ عادية: \`${staticEmojis.size}\` | 🎞️ متحركة: \`${animatedEmojis.size}\`\n\n`;

        if (staticEmojis.size > 0) {
            desc += `**🖼️ الإيموجيات العادية:**\n`;
            staticEmojis.forEach(e => { desc += `<:${e.name}:${e.id}> \`${e.name}\`\n`; });
        }

        if (animatedEmojis.size > 0) {
            desc += `\n**🎞️ الإيموجيات المتحركة:**\n`;
            animatedEmojis.forEach(e => { desc += `<a:${e.name}:${e.id}> \`${e.name}\`\n`; });
        }

        // Split if too long
        const chunks = [];
        while (desc.length > 4000) {
            chunks.push(desc.slice(0, 4000));
            desc = desc.slice(4000);
        }
        chunks.push(desc);

        for (let i = 0; i < chunks.length; i++) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🎭 إيموجيات السيرفر`)
                .setDescription(chunks[i])
                .setFooter({ text: `صفحة ${i+1}/${chunks.length} | Made by STEVEN` })
                .setTimestamp();

            if (i === 0) await interaction.editReply({ embeds: [embed] });
            else await interaction.followUp({ embeds: [embed] });
        }
    }
}
