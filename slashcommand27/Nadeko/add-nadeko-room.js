const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField,PermissionFlagsBits, } = require("discord.js");
const { nadekoDB } = require('../../db-manager');
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('add-nadeko-room')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('اضافة روم يتم تفعيل الخاصية فيها')
    .addChannelOption(Option => Option
        .setName(`room`)
        .setDescription(`الروم`)
        .setRequired(true)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
const room = interaction.options.getChannel(`room`)
let rooms = nadekoDB.get(`rooms_${interaction.guild.id}`)
if(!rooms) {
    await nadekoDB.set(`rooms_${interaction.guild.id}` , [])
}
rooms = nadekoDB.get(`rooms_${interaction.guild.id}`)
await db.push(`rooms_${interaction.guild.id}` , room.id)

return interaction.editReply({content:`**تم اضافة الروم بنجاح**`})

}
}