const { ChatInputCommandInteraction, Client, SlashCommandBuilder, EmbedBuilder, PermissionsBitField,PermissionFlagsBits, } = require("discord.js");
const { autolineDB } = require('../../db-manager');
const isImage = require('is-image-header');

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-autoline-line')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('تحديد الخط')
        .addStringOption(option => 
            option
                .setName('line')
                .setDescription('الخط')
                .setRequired(true)), // or false
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const line = await interaction.options.getString('line');
            await autolineDB.set(`line_${interaction.guild.id}`, line);
            let embed = new EmbedBuilder()
                .setDescription('**تم تحديد الخط**')
                .setColor('Green')
                .setImage(line)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) });
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log("⛔ | error in set-line command", error);
        }
    }
};
