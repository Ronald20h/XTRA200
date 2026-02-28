const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const azkarDB = new Database('./Json-db/Bots/azkarDB.json')

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('azkar-time')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تحديد وقت إرسال الأذكار')
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('الوقت بالدقائق (من 1 إلى 60)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const minutes = interaction.options.getInteger('minutes');
        
        azkarDB.set(`azkar_interval_${interaction.guild.id}`, minutes);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم تحديد وقت الأذكار')
            .setDescription(`سيتم إرسال الأذكار كل **${minutes}** دقيقة`)
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
