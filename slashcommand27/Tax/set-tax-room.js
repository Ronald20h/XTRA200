const { SlashCommandBuilder, EmbedBuilder ,PermissionFlagsBits,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { taxDB } = require('../../db-manager');
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-tax-room')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('تحديد روم الضريبة التلقائية')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    let room = interaction.options.getChannel(`room`)
    await taxDB.set(`tax_room_${interaction.guild.id}` , room.id)
  
    return interaction.reply({content:`**تم تحديد الروم ${room} بنجاح**`})
}
}