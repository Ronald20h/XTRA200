const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { levelDB } = require('../../db-manager');
const { getLevelFromXP, xpForLevel } = require('../../handlers/level-system');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('اعرض رتبتك ومستواك')
    .addUserOption(o => o.setName('user').setDescription('العضو').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const key = `${guildId}_${target.id}`;

    const userData = levelDB.get(key) || { xp: 0, level: 0, messages: 0 };
    const xp = userData.xp || 0;
    const level = userData.level || 0;
    const messages = userData.messages || 0;

    const { remaining, needed } = getLevelFromXP(xp);
    const progress = Math.floor((remaining / needed) * 10);
    const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 مستوى ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🎯 المستوى', value: `\`${level}\``, inline: true },
        { name: '⭐ XP', value: `\`${remaining}/${needed}\``, inline: true },
        { name: '💬 عدد الرسائل', value: `\`${messages}\``, inline: true },
        { name: '📈 التقدم', value: `\`[${bar}]\` ${Math.floor((remaining / needed) * 100)}%`, inline: false }
      )
      .setFooter({ text: interaction.guild.name })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
