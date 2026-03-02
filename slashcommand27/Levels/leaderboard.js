const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levelDB } = require('../../db-manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('عرض أعلى الأعضاء مستوىً'),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const members = interaction.guild.members.cache;
    const data = [];
    members.forEach(m => {
      const xp = levelDB.get(`xp_${guildId}_${m.id}`) || 0;
      const level = levelDB.get(`level_${guildId}_${m.id}`) || 0;
      if (xp > 0) data.push({ id: m.id, tag: m.user.username, xp, level });
    });
    data.sort((a, b) => b.xp - a.xp);
    const top = data.slice(0, 10);
    const desc = top.length ? top.map((u, i) => `**${i+1}.** <@${u.id}> - المستوى \`${u.level}\` | XP: \`${u.xp}\``).join('\n') : 'لا يوجد بيانات بعد';
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 أعلى الأعضاء مستوىً')
      .setDescription(desc)
      .setFooter({ text: interaction.guild.name });
    await interaction.reply({ embeds: [embed] });
  }
};
