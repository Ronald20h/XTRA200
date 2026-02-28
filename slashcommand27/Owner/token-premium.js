const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const protectDB = require('../../protect-config');

// ===== دوال مساعدة =====
function getPremiumData() {
    return protectDB.get('token_premium_data') || {};
}

function savePremiumData(data) {
    protectDB.set('token_premium_data', data);
}

function checkPremiumAccess(userId) {
    const data = getPremiumData();
    if (!data[userId]) return false;
    // تحقق من انتهاء الوقت
    if (data[userId].expiresAt && Date.now() > data[userId].expiresAt) {
        delete data[userId];
        savePremiumData(data);
        return false;
    }
    return true;
}

function formatDuration(ms) {
    if (!ms) return '♾️ دائم';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (days > 0) return `${days} يوم${hours > 0 ? ` و ${hours} ساعة` : ''}`;
    return `${hours} ساعة`;
}

function formatExpiry(expiresAt) {
    if (!expiresAt) return '♾️ دائم';
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return '❌ منتهي';
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    if (days > 0) return `${days}ي ${hours}س (${new Date(expiresAt).toLocaleDateString('ar')})`;
    return `${hours}س ${mins}د`;
}

module.exports = {
    ownersOnly: true,
    adminsOnly: false,
    checkPremiumAccess, // نصدّره عشان scan-tokens يستخدمه
    data: new SlashCommandBuilder()
        .setName('token-premium')
        .setDescription('إدارة صلاحيات نظام كشف التوكنات (للأونر فقط)')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('إضافة صلاحية لمستخدم مع تحديد المدة')
                .addUserOption(o => o.setName('user').setDescription('المستخدم').setRequired(true))
                .addStringOption(o => o.setName('duration').setDescription('المدة: 1d = يوم، 7d = أسبوع، 30d = شهر، perm = دائم').setRequired(true)
                    .addChoices(
                        { name: '1 يوم', value: '1d' },
                        { name: '3 أيام', value: '3d' },
                        { name: '7 أيام (أسبوع)', value: '7d' },
                        { name: '30 يوم (شهر)', value: '30d' },
                        { name: '90 يوم (3 أشهر)', value: '90d' },
                        { name: '♾️ دائم', value: 'perm' },
                    )))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('إزالة صلاحية من مستخدم')
                .addUserOption(o => o.setName('user').setDescription('المستخدم').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('عرض قائمة المستخدمين المسموح لهم'))
        .addSubcommand(sub =>
            sub.setName('check')
                .setDescription('فحص صلاحية مستخدم')
                .addUserOption(o => o.setName('user').setDescription('المستخدم').setRequired(true))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false }); // ← مش مخفية

        try {
            const subcommand = interaction.options.getSubcommand();
            const data = getPremiumData();

            // ===== إضافة صلاحية =====
            if (subcommand === 'add') {
                const user = interaction.options.getUser('user');
                const durationStr = interaction.options.getString('duration');

                // حساب وقت الانتهاء
                const durationMap = { '1d': 86400000, '3d': 259200000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 };
                const isPerm = durationStr === 'perm';
                const durationMs = isPerm ? null : durationMap[durationStr];
                const expiresAt = isPerm ? null : Date.now() + durationMs;
                const alreadyHas = data[user.id] && checkPremiumAccess(user.id);

                data[user.id] = {
                    username: user.username,
                    addedBy: interaction.user.id,
                    addedAt: Date.now(),
                    expiresAt: expiresAt,
                    duration: durationStr
                };
                savePremiumData(data);

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('💎 تم إضافة صلاحية التوكنات Premium')
                    .setDescription(alreadyHas ? '> ⚠️ كان لديه صلاحية - تم تجديدها' : '> ✅ تم منح الصلاحية بنجاح')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '👤 المستخدم', value: `${user}\n\`${user.id}\``, inline: true },
                        { name: '⏳ المدة', value: `**${formatDuration(durationMs)}**`, inline: true },
                        { name: '📅 تنتهي في', value: expiresAt ? `<t:${Math.floor(expiresAt/1000)}:R>` : '♾️ لا تنتهي', inline: true },
                        { name: '🔑 الصلاحية', value: '🟢 مفعّلة الآن', inline: true },
                        { name: '👑 أُضيف بواسطة', value: `${interaction.user}`, inline: true },
                        { name: '📊 إجمالي الأعضاء', value: `\`${Object.keys(data).length}\` عضو`, inline: true }
                    )
                    .setFooter({ text: 'Made by king & STEVEN' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // ===== إزالة صلاحية =====
            if (subcommand === 'remove') {
                const user = interaction.options.getUser('user');

                if (!data[user.id]) {
                    return interaction.editReply({ content: `❌ **${user.username}** ليس لديه صلاحية من الأساس!` });
                }

                const wasExpiry = data[user.id].expiresAt;
                delete data[user.id];
                savePremiumData(data);

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🗑️ تم إزالة صلاحية التوكنات')
                    .setDescription('> تم إلغاء الصلاحية بنجاح')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '👤 المستخدم', value: `${user}\n\`${user.id}\``, inline: true },
                        { name: '🔑 الصلاحية', value: '🔴 ملغاة', inline: true },
                        { name: '📊 إجمالي الأعضاء', value: `\`${Object.keys(data).length}\` عضو`, inline: true }
                    )
                    .setFooter({ text: `بواسطة ${interaction.user.username} • Made by king & STEVEN` })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // ===== قائمة الأعضاء =====
            if (subcommand === 'list') {
                // تنظيف المنتهية
                let cleaned = 0;
                for (const [uid, info] of Object.entries(data)) {
                    if (info.expiresAt && Date.now() > info.expiresAt) {
                        delete data[uid];
                        cleaned++;
                    }
                }
                if (cleaned > 0) savePremiumData(data);

                const entries = Object.entries(data);
                if (entries.length === 0) {
                    return interaction.editReply({ embeds: [new EmbedBuilder()
                        .setColor('#FF6600')
                        .setTitle('📋 قائمة صلاحيات التوكنات')
                        .setDescription('لا يوجد أعضاء لديهم صلاحية حالياً.')
                        .setTimestamp()
                    ]});
                }

                const userLines = await Promise.all(entries.map(async ([uid, info], i) => {
                    let uname = info.username || uid;
                    try { const u = await interaction.client.users.fetch(uid); uname = u.username; } catch {}
                    const expiry = info.expiresAt ? `<t:${Math.floor(info.expiresAt/1000)}:R>` : '♾️ دائم';
                    return `\`${i+1}\` **${uname}** • ${expiry}`;
                }));

                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('💎 قائمة أعضاء التوكنات Premium')
                    .setDescription(userLines.join('\n'))
                    .addFields(
                        { name: '📊 الإجمالي', value: `\`${entries.length}\` عضو`, inline: true },
                        { name: '🗑️ تم تنظيفه', value: `\`${cleaned}\` منتهية`, inline: true }
                    )
                    .setFooter({ text: 'Made by king & STEVEN' })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // ===== فحص صلاحية =====
            if (subcommand === 'check') {
                const user = interaction.options.getUser('user');
                const info = data[user.id];
                const hasAccess = checkPremiumAccess(user.id);

                const embed = new EmbedBuilder()
                    .setColor(hasAccess ? '#00FF00' : '#FF0000')
                    .setTitle(hasAccess ? '✅ لديه صلاحية' : '❌ ليس لديه صلاحية')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '👤 المستخدم', value: `${user}\n\`${user.id}\``, inline: true },
                        { name: '🔑 الحالة', value: hasAccess ? '🟢 مفعّلة' : '🔴 غير مفعّلة', inline: true },
                    );

                if (info && hasAccess) {
                    embed.addFields(
                        { name: '📅 تنتهي', value: info.expiresAt ? `<t:${Math.floor(info.expiresAt/1000)}:R>` : '♾️ دائم', inline: true },
                        { name: '📆 أُضيف في', value: `<t:${Math.floor(info.addedAt/1000)}:D>`, inline: true },
                    );
                } else if (info && !hasAccess) {
                    embed.setDescription('> ⚠️ انتهت صلاحيته');
                }

                embed.setFooter({ text: 'Made by king & STEVEN' }).setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('[token-premium]', error);
            return interaction.editReply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر.' });
        }
    }
}
