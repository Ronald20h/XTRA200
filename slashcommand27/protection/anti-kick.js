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
        .setName('anti-kick')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('حماية السيرفر من الكيك الجماعي')
        .addStringOption(o =>
            o.setName('status').setDescription('تفعيل أو تعطيل').setRequired(true)
                .addChoices({ name: 'تفعيل - ON', value: 'on' }, { name: 'تعطيل - OFF', value: 'off' }))
        .addIntegerOption(o =>
            o.setName('limit').setDescription('عدد الكيكات قبل الباند (افتراضي: 3)').setRequired(false)),
    async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
        await interaction.deferReply({ ephemeral: false });
        const status = interaction.options.getString('status');
        const limit = interaction.options.getInteger('limit') || 3;
        protectDB.set(`anti_kick_${interaction.guild.id}`, status === 'on');
        protectDB.set(`anti_kick_limit_${interaction.guild.id}`, limit);
        const embed = new EmbedBuilder()
            .setColor(status === 'on' ? '#00FF00' : '#FF0000')
            .setTitle(status === 'on' ? '✅ تم تفعيل حماية الكيك الجماعي' : '❌ تم تعطيل حماية الكيك الجماعي')
            .addFields(
                { name: '📊 الحد المسموح', value: `\`${limit}\` كيك في الدقيقة`, inline: true },
                { name: '🔨 العقوبة', value: '`باند فوري`', inline: true }
            )
            .setFooter({ text: 'Made by STEVEN' }).setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
}
