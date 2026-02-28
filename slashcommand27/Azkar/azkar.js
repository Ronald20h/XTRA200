const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const azkarDB = new Database('./Json-db/Bots/azkarDB.json')

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('azkar')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تفعيل أو تعطيل الأذكار')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('تفعيل أو تعطيل')
                .setRequired(true)
                .addChoices(
                    { name: 'تفعيل - ON', value: 'on' },
                    { name: 'تعطيل - OFF', value: 'off' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const status = interaction.options.getString('status');
        
        azkarDB.set(`azkar_enabled_${interaction.guild.id}`, status === 'on');

        const embed = new EmbedBuilder()
            .setColor(status === 'on' ? '#00FF00' : '#FF0000')
            .setTitle(status === 'on' ? '✅ تم تفعيل الأذكار' : '❌ تم تعطيل الأذكار')
            .setDescription(status === 'on' ? 'سيتم إرسال الأذكار تلقائياً الآن' : 'تم إيقاف إرسال الأذكار')
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
