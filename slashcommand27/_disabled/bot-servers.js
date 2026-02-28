const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: true,
    adminsOnly: false,
    data: new SlashCommandBuilder()
        .setName('bot-servers')
        .setDescription('عرض جميع السيرفرات التي البوت موجود فيها'),

    async execute(interaction) {
        console.log('[bot-servers] Command executed by:', interaction.user.tag);
        
        await interaction.deferReply({ ephemeral: true });

        try {
            const guilds = interaction.client.guilds.cache;
            const totalServers = guilds.size;
            const totalMembers = guilds.reduce((acc, g) => acc + g.memberCount, 0);

            console.log(`[bot-servers] Total servers: ${totalServers}, Total members: ${totalMembers}`);

            if (totalServers === 0) {
                return interaction.editReply({ content: '❌ البوت غير موجود في أي سيرفر!' });
            }

            const sortedGuilds = [...guilds.values()].sort((a, b) => b.memberCount - a.memberCount);

            let description = `📊 **إجمالي السيرفرات:** \`${totalServers}\`\n👥 **إجمالي الأعضاء:** \`${totalMembers.toLocaleString()}\`\n\n`;
            
            for (let i = 0; i < Math.min(sortedGuilds.length, 25); i++) {
                const guild = sortedGuilds[i];
                let invite = '❌ لا يوجد';
                
                try {
                    const textChannels = guild.channels.cache.filter(c => c.type === 0);
                    const channel = textChannels.find(c => {
                        const perms = c.permissionsFor(guild.members.me);
                        return perms && perms.has('CreateInstantInvite');
                    });
                    
                    if (channel) {
                        const inv = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
                        if (inv) invite = `https://discord.gg/${inv.code}`;
                    }
                } catch (e) {}

                description += `**${i + 1}. ${guild.name}**\n`;
                description += `👥 الأعضاء: \`${guild.memberCount}\` | 🆔 \`${guild.id}\`\n`;
                description += `🔗 ${invite !== '❌ لا يوجد' ? `[رابط الدعوة](${invite})` : invite}\n\n`;
            }

            if (sortedGuilds.length > 25) {
                description += `\n📄 *يتم عرض أول 25 سيرفر فقط من أصل ${totalServers}*`;
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🌐 قائمة سيرفرات البوت')
                .setDescription(description)
                .setTimestamp()
                .setFooter({ text: 'Made by STEVEN • للأونر فقط' });

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[bot-servers] Error:', error);
            return interaction.editReply({
                content: `❌ حدث خطأ:\n\`\`\`${error.message}\`\`\``,
            }).catch(console.error);
        }
    }
}
