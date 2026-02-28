const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db")
const azkarDB = new Database('./Json-db/Bots/azkarDB.json')

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('azkar-mode')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تغيير شكل الأذكار (إمبد أو نص عادي)')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('اختر الشكل')
                .setRequired(true)
                .addChoices(
                    { name: 'إمبد - Embed', value: 'on' },
                    { name: 'نص عادي - Text', value: 'off' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const mode = interaction.options.getString('mode');
        
        azkarDB.set(`azkar_embed_${interaction.guild.id}`, mode === 'on');

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم تغيير شكل الأذكار')
            .setDescription(mode === 'on' ? 'سيتم إرسال الأذكار بشكل إمبد' : 'سيتم إرسال الأذكار كنص عادي')
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
