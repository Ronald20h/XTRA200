const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const protectDB = require('../../protect-config');

function checkPremiumAccess(userId) {
    const data = protectDB.get('token_premium_data') || {};
    if (!data[userId]) return false;
    if (data[userId].expiresAt && Date.now() > data[userId].expiresAt) {
        delete data[userId];
        protectDB.set('token_premium_data', data);
        return false;
    }
    return true;
}

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('scan-tokens')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('كشف الأعضاء الوهمية (التوكنات) في السيرفر'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        if (!checkPremiumAccess(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B00')
                .setTitle('🔒 نظام كشف التوكنات - Premium')
                .setDescription('**هذه الخدمة للأعضاء المميزين فقط! 💎**\n\nتواصل مع الأونر للحصول على الصلاحية.')
                .addFields(
                    { name: '👤 معلوماتك', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
                    { name: '📊 الحالة', value: '🔴 غير مشترك', inline: true }
                )
                .setFooter({ text: 'Made by king & STEVEN' })
                .setTimestamp();
            const btn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('🌐 سيرفر الدعم').setStyle(ButtonStyle.Link).setURL('https://discord.gg/HC8V8cPF4')
            );
            return interaction.editReply({ embeds: [embed], components: [btn] });
        }

        const guild = interaction.guild;
        await guild.members.fetch();
        const suspicious = [];
        const now = Date.now();

        guild.members.cache.forEach(member => {
            if (member.user.bot) return;
            let score = 0;
            let reasons = [];
            const ageDays = Math.floor((now - member.user.createdTimestamp) / 86400000);
            if (ageDays < 7)  { score += 3; reasons.push(`حساب عمره ${ageDays} يوم`); }
            if (!member.user.avatar) { score += 2; reasons.push('بدون صورة'); }
            if (member.roles.cache.size === 1) { score += 1; reasons.push('بدون رتب'); }
            const joinHours = Math.floor((now - member.joinedTimestamp) / 3600000);
            if (joinHours < 24) { score += 2; reasons.push(`انضم قبل ${joinHours} ساعة`); }
            if (/^[a-z]+\d{4,}$/i.test(member.user.username)) { score += 2; reasons.push('اسم مشبوه'); }
            if (score >= 4) suspicious.push({ member, score, reasons });
        });

        suspicious.sort((a, b) => b.score - a.score);

        if (suspicious.length === 0) {
            return interaction.editReply({ embeds: [new EmbedBuilder()
                .setColor('#00FF00').setTitle('✅ السيرفر نظيف').setDescription('لا يوجد أعضاء مشبوهون!').setTimestamp()
            ]});
        }

        const list = suspicious.slice(0, 20).map((s, i) =>
            `\`${i+1}\` **${s.member.user.username}** — ${s.score} نقاط\n└ ${s.reasons.join(' • ')}`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚨 تم العثور على أعضاء مشبوهين')
            .setDescription(list)
            .addFields(
                { name: '📊 الإجمالي', value: `\`${suspicious.length}\` عضو مشبوه`, inline: true },
                { name: '💎 Premium', value: '✅ مفعّل', inline: true }
            )
            .setFooter({ text: `بواسطة ${interaction.user.username} • Made by king & STEVEN` })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
}
