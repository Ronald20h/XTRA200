const protectDB = require('../../protect-config');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    ownersOnly: false,
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('protection-status')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('عرض حالة جميع أنظمة الحماية في السيرفر'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        try {
            const g = interaction.guild.id;

            // جمع كل البيانات
            const systems = {
                serverEdit:     protectDB.get(`anti_server_edit_${g}`),
                channelEdit:    protectDB.get(`anti_channel_edit_${g}`),
                channelCreate:  protectDB.get(`anti_channel_create_${g}`),
                ban:            protectDB.get(`ban_status_${g}`) === 'on',
                banLimit:       protectDB.get(`ban_limit_${g}`) || 3,
                kick:           protectDB.get(`anti_kick_${g}`),
                kickLimit:      protectDB.get(`anti_kick_limit_${g}`) || 3,
                bots:           protectDB.get(`antibots_status_${g}`) === 'on',
                deleteRoles:    protectDB.get(`antideleteroles_status_${g}`) === 'on',
                deleteRolesLim: protectDB.get(`antideleteroles_limit_${g}`) || 3,
                roleCreate:     protectDB.get(`anti_role_create_${g}`),
                roleEdit:       protectDB.get(`anti_role_edit_${g}`),
                deleteRooms:    protectDB.get(`antideleterooms_status_${g}`) === 'on',
                deleteRoomsLim: protectDB.get(`antideleterooms_limit_${g}`) || 3,
                webhook:        protectDB.get(`anti_webhook_${g}`),
                logChannel:     protectDB.get(`set_protect_logs_${g}`),
                savedName:      protectDB.get(`server_name_${g}`),
            };

            const on  = (v) => v ? '🟢 **مفعّل**' : '🔴 **معطّل**';
            const lim = (n) => `\`${n}\``;

            // حساب عدد الأنظمة المفعلة
            const allSystems = [
                systems.serverEdit, systems.channelEdit, systems.channelCreate,
                systems.ban, systems.kick, systems.bots, systems.deleteRoles,
                systems.roleCreate, systems.roleEdit, systems.deleteRooms, systems.webhook
            ];
            const activeCount  = allSystems.filter(Boolean).length;
            const totalCount   = allSystems.length;
            const protectLevel = activeCount === 0 ? '🔴 لا توجد حماية' :
                                 activeCount < 4   ? '🟠 حماية ضعيفة' :
                                 activeCount < 8   ? '🟡 حماية متوسطة' :
                                 activeCount < 11  ? '🟢 حماية جيدة' :
                                                    '💎 حماية كاملة';

            // Progress bar
            const filled = Math.round((activeCount / totalCount) * 10);
            const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            const botRole   = botMember?.roles.highest;
            const isTopRole = botRole?.position === (interaction.guild.roles.highest.position);

            const embed = new EmbedBuilder()
                .setColor(
                    activeCount === 0 ? '#FF0000' :
                    activeCount < 4   ? '#FF6600' :
                    activeCount < 8   ? '#FFFF00' : '#00FF00'
                )
                .setTitle(`🛡️ حالة نظام الحماية — ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setDescription([
                    `> **مستوى الحماية:** ${protectLevel}`,
                    `> **\`${bar}\`** ${activeCount}/${totalCount} أنظمة مفعّلة`,
                    `> **روم السجل:** ${systems.logChannel ? `<#${systems.logChannel}>` : '`غير محدد`'}`,
                    `> **رتبة البوت:** ${botRole ? `\`${botRole.name}\`` : '؟'} ${isTopRole ? '✅ أعلى رتبة' : '⚠️ ليست أعلى رتبة!'}`,
                ].join('\n'))
                .addFields(
                    {
                        name: '🏠 حماية السيرفر',
                        value: [
                            `╔ اسم وصورة السيرفر: ${on(systems.serverEdit)}`,
                            `╚ الاسم المحفوظ: \`${systems.savedName || 'غير محدد'}\``,
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '📺 حماية الرومات',
                        value: [
                            `╔ تعديل وحذف الرومات: ${on(systems.channelEdit)}`,
                            `╠ إنشاء رومات جديدة: ${on(systems.channelCreate)}`,
                            `╚ حذف الرومات (جماعي): ${on(systems.deleteRooms)} — الحد: ${lim(systems.deleteRoomsLim)}`,
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🎭 حماية الرتب',
                        value: [
                            `╔ حذف الرتب (جماعي): ${on(systems.deleteRoles)} — الحد: ${lim(systems.deleteRolesLim)}`,
                            `╠ إنشاء رتب جديدة: ${on(systems.roleCreate)}`,
                            `╚ تعديل الرتب وصلاحياتها: ${on(systems.roleEdit)}`,
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🔨 حماية عامة',
                        value: [
                            `╔ باند جماعي: ${on(systems.ban)} — الحد: ${lim(systems.banLimit)}`,
                            `╠ كيك جماعي: ${on(systems.kick)} — الحد: ${lim(systems.kickLimit)}`,
                            `╠ إضافة بوتات: ${on(systems.bots)}`,
                            `╚ ويب هوكس: ${on(systems.webhook)}`,
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({
                    text: `Made by STEVEN • ${activeCount === totalCount ? 'السيرفر محمي بالكامل 🔥' : 'استخدم /setup-protection لتفعيل الكل'}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            if (!isTopRole) {
                embed.addFields({
                    name: '⚠️ تحذير مهم',
                    value: `رتبة البوت **\`${botRole?.name}\`** ليست الأعلى في السيرفر!\nارفعها لأعلى موضع حتى تعمل الحماية بشكل كامل.`,
                    inline: false
                });
            }

            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error('[protection-status]', e);
            return interaction.editReply({ content: '❌ حدث خطأ أثناء تحميل البيانات.' });
        }
    }
}
