const protectDB = require('../../protect-config');

const { owners: _botOwners } = require('../../config');
function _isProtectionAuthorized(interaction) {
  const bOwners = Array.isArray(_botOwners) ? _botOwners : [_botOwners];
  return bOwners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
}
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('anti-channel-create')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('حماية السيرفر من إنشاء رومات جديدة')
        .addStringOption(o =>
            o.setName('status').setDescription('تفعيل أو تعطيل').setRequired(true)
                .addChoices({ name: 'تفعيل - ON', value: 'on' }, { name: 'تعطيل - OFF', value: 'off' })),
    async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
        await interaction.deferReply({ ephemeral: false });
        const status = interaction.options.getString('status');
        protectDB.set(`anti_channel_create_${interaction.guild.id}`, status === 'on');
        const embed = new EmbedBuilder()
            .setColor(status === 'on' ? '#00FF00' : '#FF0000')
            .setTitle(status === 'on' ? '✅ تم تفعيل حماية إنشاء الرومات' : '❌ تم تعطيل حماية إنشاء الرومات')
            .addFields({ name: '🔨 العقوبة', value: 'باند فوري + حذف الروم تلقائياً', inline: false })
            .setFooter({ text: 'Made by STEVEN' }).setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
}
