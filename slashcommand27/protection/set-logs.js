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
    .setName('set-protect-logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('لتحديد روم لوج الحماية')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    if (!_isProtectionAuthorized(interaction)) {
      return interaction.reply({ content: '❌ هذا الأمر لصاحب البوت أو صاحب السيرفر فقط!', ephemeral: true });
    }
    await interaction.deferReply({ephemeral:false})
    try {
        let room = interaction.options.getChannel(`room`)
        await db.set(`protectLog_room_${interaction.guild.id}` , room.id)
      
        return interaction.editReply({content:`**تم تحديد الروم ${room} بنجاح**`})
    } catch {
    }
}
}