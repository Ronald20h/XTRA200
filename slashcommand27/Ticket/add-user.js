const { PermissionsBitField,PermissionFlagsBits,SlashCommandBuilder } = require("discord.js");
const { ticketDB } = require('../../db-manager');
module.exports = {
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('add-user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Add a user to the current ticket channel')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('Select the user to add')
                .setRequired(true)
        ),
    
    /**
     * @param { import('discord.js').ChatInputCommandInteraction } interaction 
     */
    async execute(interaction) {
                const member = interaction.options.getMember('user');
        const supportRoleID = ticketDB.get(`TICKET-PANEL_${interaction.channel.id}`)?.Support;

        if (!interaction.member.roles.cache.has(supportRoleID)) {
            return interaction.reply({ content: `:x: You do not have permission to add users to this ticket.`, ephemeral: true });
        }

        if (!ticketDB.has(`TICKET-PANEL_${interaction.channel.id}`)) {
            return interaction.reply({ content: `> This channel isn't a ticket`, ephemeral: true });
        }

        await interaction.channel.permissionOverwrites.edit(member.user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        return interaction.reply({ content: `${member} has been added to the ticket ${interaction.channel}.` });
    }
};
