const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField,PermissionFlagsBits, } = require("discord.js");
const { tokenDB } = require('../../db-manager');
module.exports = {
    ownersOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-all-tokens')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('إزالة جميع بوتات البرودكاست'),
    async execute(interaction) {
        try {
            await tokenDB.delete(`tokens_${interaction.guild.id}`);
            return interaction.reply({ content: '**تم إزالة جميع التوكنات من السيرفر بنجاح!**' });
        } catch (error) {
            return interaction.reply({ content: `**حدث خطأ**` });
        }
    }
};
