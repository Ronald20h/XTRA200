const protectDB = require('../../protect-config');

const { owners: _botOwners } = require('../../config');
function _isProtectionAuthorized(interaction) {
  const bOwners = Array.isArray(_botOwners) ? _botOwners : [_botOwners];
  return bOwners.includes(interaction.user.id) || interaction.user.id === interaction.guild.ownerId;
}
const { logsDB } = require('../../database');
const db = protectDB;
const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField,PermissionFlagsBits, ButtonBuilder, ActionRowBuilder } = require("discord.js");
module.exports = {
    ownersOnly: false,
    adminsOnly: false,
    data: new SlashCommandBuilder()
    .setName('anti-bots')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('تسطيب نظام الحماية من البوتات')
    .addStringOption(Option => Option
        .setName(`status`)
        .setDescription(`الحالة`)
        .setRequired(true)
        .addChoices(
            {
                name:`On` , value:`on`
            },
            {
                name:`Off` , value:`of`
            }
        ))
   , // or false
async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
    await interaction.deferReply({ephemeral:false})
    try {
      const status = interaction.options.getString(`status`)
      await db.set(`antibots_status_${interaction.guild.id}` , status)
     return interaction.editReply({content:`**تم بنجاح تعيين الحالة \n - تاكد من رفع رتبتي لاعلى رتبة في السيرفر**`})
    } catch {
    }
}
}