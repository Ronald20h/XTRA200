const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('عرض سرعة البوت ومعلوماته'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const ping = interaction.client.ws.ping;
        const serverCount = interaction.client.guilds.cache.size;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '⚡ سرعة البوت', value: `\`${ping}ms\``, inline: true },
                { name: '📊 عدد السيرفرات', value: `\`${serverCount}\``, inline: true },
                { name: '⏱️ وقت التشغيل', value: `\`${uptimeString}\``, inline: false },
                { name: '👤 صانع البوت', value: `\`STEVEN\``, inline: false }
            )
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
