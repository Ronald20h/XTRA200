const { SlashCommandBuilder, PermissionsBitField,PermissionFlagsBits,EmbedBuilder } = require("discord.js");
const { ticketDB } = require('../../db-manager');
module.exports = {
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Delete the current ticket channel'),
        
    async execute(interaction) {
        const Support = ticketDB.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;
        if (!interaction.member.roles.cache.has(Support)) {
            return interaction.reply({ content: ':x: Only Support', ephemeral: true });
        } 

        if (!ticketDB.has(`TICKET-PANEL_${interaction.channel.id}`)) {
            return interaction.reply({ content: 'This channel isn\'t a ticket', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Ticket will be deleted in a few seconds');
        
        await interaction.reply({ embeds: [embed] });
        
        setTimeout(() => {
            interaction.channel.delete();
        }, 4500);

        const Logs = ticketDB.get(`LogsRoom_${interaction.guild.id}`);
        const Log = interaction.guild.channels.cache.get(Logs);
        const Ticket = ticketDB.get(`TICKET-PANEL_${interaction.channel.id}`);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('Delete Ticket')
            .addFields(
                { name: 'Name Ticket', value: `${interaction.channel.name}` },
                { name: 'Owner Ticket', value: `${Ticket.author}` },
                { name: 'Deleted By', value: `${interaction.user}` },
            )
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        Log?.send({ embeds: [logEmbed] });
        ticketDB.delete(`TICKET-PANEL_${interaction.channel.id}`);
    }
}
