const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const azkarDB = new Database('./Json-db/Bots/azkarDB.json')

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('set-azkar-channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تحديد روم الأذكار')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('الروم المخصص للأذكار')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const channel = interaction.options.getChannel('channel');
        
        azkarDB.set(`azkar_channel_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم تحديد روم الأذكار')
            .setDescription(`تم تحديد ${channel} كروم للأذكار\n\nسيتم إرسال الأذكار تلقائياً في هذا الروم حسب الوقت المحدد`)
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
