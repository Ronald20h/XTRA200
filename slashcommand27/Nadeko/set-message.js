const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField,PermissionFlagsBits, } = require("discord.js");
const { nadekoDB } = require('../../db-manager');
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('تحديد الرسالة عند الدخول')
    .addStringOption(Option => Option
        .setName(`message`)
        .setDescription(`الرسالة`)
        .setRequired(true)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
const message = interaction.options.getString(`message`)
await nadekoDB.set(`message_${interaction.guild.id}` , message)
return interaction.editReply({content:`**تم تحديد الرسالة بنجاح**`})

}
}