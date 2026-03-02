const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder()
    .setName('unhide')
    .setDescription('إظهار الروم'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: '❌ لا تمتلك صلاحية إدارة الرومات', ephemeral: true });

    try {
      await interaction.deferReply({ ephemeral: false });
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { ViewChannel: true }
      );
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('✅ تم إظهار الروم')
        .setDescription(`الروم: ${interaction.channel}`)
        .setFooter({ text: `بواسطة ${interaction.user.username}` })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    } catch (e) {
      return interaction.editReply({ content: `❌ خطأ: ${e.message}` });
    }
  }
};
