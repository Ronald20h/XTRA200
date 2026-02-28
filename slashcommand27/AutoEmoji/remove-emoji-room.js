const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require("st.db");
const autoEmojiDB = new Database('./Json-db/Bots/autoEmojiDB.json');

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('remove-emoji-room')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('إزالة روم من نظام الإيموجي التلقائي')
        .addChannelOption(o => o.setName('channel').setDescription('الروم').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const channel = interaction.options.getChannel('channel');
        let rooms = autoEmojiDB.get(`emoji_rooms_${interaction.guild.id}`) || [];

        const index = rooms.findIndex(r => r.channelId === channel.id);
        if (index === -1) {
            return interaction.editReply({ content: '❌ هذا الروم غير موجود في نظام الإيموجي!' });
        }

        rooms.splice(index, 1);
        autoEmojiDB.set(`emoji_rooms_${interaction.guild.id}`, rooms);

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('✅ تم إزالة الروم')
            .setDescription(`تم إزالة ${channel} من نظام الإيموجي التلقائي`)
            .setFooter({ text: 'Made by STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
