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
        .setName('setup-protection')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تفعيل أو تعطيل جميع أنظمة الحماية دفعة واحدة')
        .addStringOption(o =>
            o.setName('status').setDescription('تفعيل أو تعطيل كل الحماية').setRequired(true)
                .addChoices({ name: '🟢 تفعيل الكل - ON', value: 'on' }, { name: '🔴 تعطيل الكل - OFF', value: 'off' }))
        .addChannelOption(o =>
            o.setName('log-channel').setDescription('روم سجل الحماية (اختياري)').setRequired(false)),
    async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
        await interaction.deferReply({ ephemeral: false });
        const status = interaction.options.getString('status');
        const logChannel = interaction.options.getChannel('log-channel');
        const isOn = status === 'on';
        const guildId = interaction.guild.id;
        const currentName = interaction.guild.name;
        const currentIcon = interaction.guild.iconURL({ dynamic: true, size: 4096 });

        protectDB.set(`anti_server_edit_${guildId}`, isOn);
        protectDB.set(`server_name_${guildId}`, currentName);
        protectDB.set(`server_icon_${guildId}`, currentIcon);

        const channelSnapshot = {};
        interaction.guild.channels.cache.forEach(ch => {
            channelSnapshot[ch.id] = { name: ch.name, type: ch.type, parentId: ch.parentId || null, position: ch.rawPosition };
        });
        protectDB.set(`anti_channel_edit_${guildId}`, isOn);
        protectDB.set(`channels_snapshot_${guildId}`, channelSnapshot);
        protectDB.set(`anti_channel_create_${guildId}`, isOn);
        protectDB.set(`antiban_status_${guildId}`, isOn ? 'on' : 'off');
        protectDB.set(`ban_status_${guildId}`, isOn ? 'on' : 'off');
        protectDB.set(`ban_limit_${guildId}`, 3);
        protectDB.set(`ban_users_${guildId}`, []);
        protectDB.set(`antideleteroles_status_${guildId}`, isOn ? 'on' : 'off');
        protectDB.set(`antideleteroles_limit_${guildId}`, 3);
        protectDB.set(`rolesdelete_users_${guildId}`, []);
        protectDB.set(`antideleterooms_status_${guildId}`, isOn ? 'on' : 'off');
        protectDB.set(`antideleterooms_limit_${guildId}`, 3);
        protectDB.set(`roomsdelete_users_${guildId}`, []);
        protectDB.set(`antibots_status_${guildId}`, isOn ? 'on' : 'off');
        protectDB.set(`anti_kick_${guildId}`, isOn);
        protectDB.set(`anti_kick_limit_${guildId}`, 3);
        protectDB.set(`anti_role_create_${guildId}`, isOn);
        protectDB.set(`anti_role_edit_${guildId}`, isOn);
        protectDB.set(`anti_webhook_${guildId}`, isOn);

        if (logChannel) protectDB.set(`set_protect_logs_${guildId}`, logChannel.id);
        const logChannelId = logChannel?.id || protectDB.get(`set_protect_logs_${guildId}`);
        const logMention = logChannelId ? `<#${logChannelId}>` : '`غير محدد`';

        const embed = new EmbedBuilder()
            .setColor(isOn ? '#00FF00' : '#FF0000')
            .setTitle(isOn ? '🛡️ تم تفعيل جميع أنظمة الحماية!' : '⛔ تم تعطيل جميع أنظمة الحماية!')
            .setDescription(isOn ? '**السيرفر الآن محمي بالكامل! أي تخريب = باند فوري 🔥**' : 'تم إيقاف جميع أنظمة الحماية.')
            .addFields(
                { name: isOn ? '✅' : '❌' + ' السيرفر (اسم + صورة)', value: `الاسم: \`${currentName}\``, inline: true },
                { name: isOn ? '✅' : '❌' + ' الرومات (حذف + تعديل + إنشاء)', value: `${Object.keys(channelSnapshot).length} روم`, inline: true },
                { name: isOn ? '✅' : '❌' + ' الرتب (حذف + إنشاء + تعديل)', value: 'مفعّلة', inline: true },
                { name: isOn ? '✅' : '❌' + ' باند جماعي', value: 'حد 3', inline: true },
                { name: isOn ? '✅' : '❌' + ' كيك جماعي', value: 'حد 3', inline: true },
                { name: isOn ? '✅' : '❌' + ' ويب هوك', value: 'مفعّلة', inline: true },
                { name: isOn ? '✅' : '❌' + ' بوتات', value: 'مفعّلة', inline: true },
                { name: '📋 روم السجل', value: logMention, inline: false },
                { name: '⚠️ مهم', value: '**ارفع رتبة البوت لأعلى رتبة في السيرفر!**', inline: false }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Made by STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
}
