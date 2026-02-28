const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levelDB } = require('../../db-manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('اعرض رتبتك ومستواك')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const xp = levelDB.get(`xp_${guildId}_${target.id}`) || 0;
    const level = levelDB.get(`level_${guildId}_${target.id}`) || 0;
    const nextXp = (level + 1) * 100;
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 مستوى ${target.username}`)
      .addFields(
        { name: '🎯 المستوى', value: `\`${level}\``, inline: true },
        { name: '⭐ XP', value: `\`${xp}/${nextXp}\``, inline: true }
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: interaction.guild.name });
    await interaction.reply({ embeds: [embed] });
  }
};
