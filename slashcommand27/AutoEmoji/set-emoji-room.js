const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { autoEmojiDB } = require('../../db-manager');
module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('set-emoji-room')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تحديد روم لحفظ الإيموجيات من السيرفرات الثانية تلقائياً')
        .addChannelOption(o => o.setName('channel').setDescription('الروم المخصص لحفظ الإيموجيات').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const channel = interaction.options.getChannel('channel');

        autoEmojiDB.set(`emoji_steal_room_${interaction.guild.id}`, channel.id);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم تحديد روم حفظ الإيموجيات')
            .setDescription(`أي إيموجي من سيرفر ثاني يُرسل في ${channel} سيُحفظ تلقائياً في سيرفرك!`)
            .addFields(
                { name: '📢 الروم', value: `${channel}`, inline: true },
                { name: '🎭 كيف يشتغل', value: 'أرسل أي ايموجي كاستم من سيرفر ثاني وسيُضاف للسيرفر تلقائياً', inline: false }
            )
            .setFooter({ text: 'Made by STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
