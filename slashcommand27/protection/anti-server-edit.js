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
        .setName('anti-server-edit')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('حماية اسم وصورة السيرفر من التغيير')
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

        // Save current server name and icon
        const currentName = interaction.guild.name;
        const currentIcon = interaction.guild.iconURL({ dynamic: true, size: 4096 });

        protectDB.set(`anti_server_edit_${interaction.guild.id}`, status === 'on');
        protectDB.set(`server_name_${interaction.guild.id}`, currentName);
        protectDB.set(`server_icon_${interaction.guild.id}`, currentIcon);

        const embed = new EmbedBuilder()
            .setColor(status === 'on' ? '#00FF00' : '#FF0000')
            .setTitle(status === 'on' ? '✅ تم تفعيل حماية السيرفر' : '❌ تم تعطيل حماية السيرفر')
            .addFields(
                { name: '🏷️ الاسم المحفوظ', value: `\`${currentName}\``, inline: true },
                { name: '🖼️ الصورة المحفوظة', value: currentIcon ? '✅ محفوظة' : '❌ لا توجد', inline: true },
                { name: '⚠️ تحذير', value: 'أي شخص يغير اسم أو صورة السيرفر سيحصل على **باند فوري**!', inline: false }
            )
            .setThumbnail(currentIcon)
            .setFooter({ text: 'Made by STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
