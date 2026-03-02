const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levelDB } = require('../../db-manager');

module.exports = {
  adminsOnly: true,
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('تعيين مستوى عضو')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
    .addIntegerOption(o => o.setName('level').setDescription('المستوى').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');
    const guildId = interaction.guild.id;
    levelDB.set(`level_${guildId}_${target.id}`, level);
    levelDB.set(`xp_${guildId}_${target.id}`, level * 100);
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setDescription(`✅ تم تعيين مستوى **${target.username}** إلى **${level}**`);
    await interaction.reply({ embeds: [embed] });
  }
};
