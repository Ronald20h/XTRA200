const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { systemDB } = require('../../db-manager');
module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('setup-decoration')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تحديد روم الزخرفة التلقائية')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('الروم المخصص للزخرفة')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const channel = interaction.options.getChannel('channel');
        
        systemDB.set(`decoration_channel_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم تحديد روم الزخرفة')
            .setDescription(`تم تحديد ${channel} كروم للزخرفة التلقائية\n\nأي رسالة يتم إرسالها في هذا الروم سيتم زخرفتها تلقائياً`)
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
