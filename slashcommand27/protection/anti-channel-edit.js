const protectDB = require('../../protect-config');

const { owners: _botOwners } = require('../../config');
function _isProtectionAuthorized(interaction) {
  const bOwners = Array.isArray(_botOwners) ? _botOwners : [_botOwners];
  return bOwners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
}
const { logsDB } = require('../../database');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('anti-channel-edit')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('حماية الرومات من التعديل والحذف')
        .addStringOption(o =>
            o.setName('status')
                .setDescription('تفعيل أو تعطيل')
                .setRequired(true)
                .addChoices(
                    { name: 'تفعيل - ON', value: 'on' },
                    { name: 'تعطيل - OFF', value: 'off' }
                )),
    async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
        await interaction.deferReply({ ephemeral: false });

        // Check if user's highest role is above bot's highest role
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
        const botHighestRole = botMember.roles.highest.position;
        const userHighestRole = interaction.member.roles.highest.position;

        if (userHighestRole <= botHighestRole) {
            return interaction.editReply({ content: '❌ رتبتك يجب أن تكون أعلى من رتبة البوت لاستخدام هذا الأمر!' });
        }

        const status = interaction.options.getString('status');

        // Save snapshot of all channels
        const channelSnapshot = {};
        interaction.guild.channels.cache.forEach(ch => {
            channelSnapshot[ch.id] = {
                name: ch.name,
                type: ch.type,
                parentId: ch.parentId || null,
                position: ch.rawPosition
            };
        });

        protectDB.set(`anti_channel_edit_${interaction.guild.id}`, status === 'on');
        protectDB.set(`channels_snapshot_${interaction.guild.id}`, channelSnapshot);

        const embed = new EmbedBuilder()
            .setColor(status === 'on' ? '#00FF00' : '#FF0000')
            .setTitle(status === 'on' ? '✅ تم تفعيل حماية الرومات' : '❌ تم تعطيل حماية الرومات')
            .addFields(
                { name: '📸 الرومات المحفوظة', value: `\`${Object.keys(channelSnapshot).length}\` روم`, inline: true },
                { name: '⚠️ تحذير', value: 'أي شخص يغير أو يحذف روم سيحصل على **باند فوري** ويرجع الروم تلقائياً!', inline: false }
            )
            .setFooter({ text: 'Made by STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
