// Dashboard Panel Handlers
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { owners } = require('../config');
const protectDB = require('../protect-config');

module.exports = async (client) => {
    
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('panel_') && !interaction.customId.startsWith('quick_')) return;

        const isOwner = owners.includes(interaction.user.id);
        const isAdmin = interaction.member.permissions.has('Administrator');
        if (interaction.customId === 'quick_setup_protection') {
            if (!isAdmin && !isOwner) return interaction.reply({ content: '❌ هذا للأدمن فقط!', ephemeral: true });
            await interaction.deferUpdate();
            const guildId = interaction.guild.id;
            const currentName = interaction.guild.name;
            const currentIcon = interaction.guild.iconURL({ dynamic: true, size: 4096 });
            const channelSnapshot = {};
            interaction.guild.channels.cache.forEach(ch => {
                channelSnapshot[ch.id] = { name: ch.name, type: ch.type, parentId: ch.parentId || null };
            });
            protectDB.set(`anti_server_edit_${guildId}`, true);
            protectDB.set(`server_name_${guildId}`, currentName);
            protectDB.set(`server_icon_${guildId}`, currentIcon);
            protectDB.set(`anti_channel_edit_${guildId}`, true);
            protectDB.set(`channels_snapshot_${guildId}`, channelSnapshot);
            protectDB.set(`anti_channel_create_${guildId}`, true);
            protectDB.set(`antiban_status_${guildId}`, 'on');
            protectDB.set(`ban_status_${guildId}`, 'on');
            protectDB.set(`ban_limit_${guildId}`, 3);
            protectDB.set(`ban_users_${guildId}`, []);
            protectDB.set(`antideleteroles_status_${guildId}`, 'on');
            protectDB.set(`antideleteroles_limit_${guildId}`, 3);
            protectDB.set(`rolesdelete_users_${guildId}`, []);
            protectDB.set(`antideleterooms_status_${guildId}`, 'on');
            protectDB.set(`antideleterooms_limit_${guildId}`, 3);
            protectDB.set(`roomsdelete_users_${guildId}`, []);
            protectDB.set(`antibots_status_${guildId}`, 'on');
            protectDB.set(`anti_kick_${guildId}`, true);
            protectDB.set(`anti_kick_limit_${guildId}`, 3);
            protectDB.set(`anti_role_create_${guildId}`, true);
            protectDB.set(`anti_role_edit_${guildId}`, true);
            protectDB.set(`anti_webhook_${guildId}`, true);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🛡️ تم تفعيل جميع أنظمة الحماية!')
                .setDescription('**السيرفر محمي بالكامل الآن 🔥**\n\n⚠️ تأكد إن رتبة البوت أعلى رتبة في السيرفر!')
                .addFields(
                    { name: '✅ السيرفر', value: 'مفعّل', inline: true },
                    { name: '✅ الرومات', value: 'مفعّل', inline: true },
                    { name: '✅ الرتب', value: 'مفعّل', inline: true },
                    { name: '✅ الباند الجماعي', value: 'مفعّل', inline: true },
                    { name: '✅ الكيك الجماعي', value: 'مفعّل', inline: true },
                    { name: '✅ البوتات والويب هوك', value: 'مفعّل', inline: true },
                )
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('quick_status_protection').setLabel('📊 عرض الحالة').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_protection').setLabel('🔙 رجوع').setStyle(ButtonStyle.Secondary)
            );
            return interaction.editReply({ embeds: [embed], components: [buttons] });
        }

        // ====== QUICK: عرض حالة الحماية ======
        if (interaction.customId === 'quick_status_protection') {
            await interaction.deferUpdate();
            const g = interaction.guild.id;
            const on = (v) => v ? '🟢 مفعّل' : '🔴 معطّل';
            const allSystems = [
                protectDB.get(`anti_server_edit_${g}`),
                protectDB.get(`anti_channel_edit_${g}`),
                protectDB.get(`anti_channel_create_${g}`),
                protectDB.get(`ban_status_${g}`) === 'on',
                protectDB.get(`anti_kick_${g}`),
                protectDB.get(`antibots_status_${g}`) === 'on',
                protectDB.get(`antideleteroles_status_${g}`) === 'on',
                protectDB.get(`anti_role_create_${g}`),
                protectDB.get(`anti_role_edit_${g}`),
                protectDB.get(`antideleterooms_status_${g}`) === 'on',
                protectDB.get(`anti_webhook_${g}`),
            ];
            const activeCount = allSystems.filter(Boolean).length;
            const totalCount = allSystems.length;
            const filled = Math.round((activeCount / totalCount) * 10);
            const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
            const protectLevel = activeCount === 0 ? '🔴 لا توجد حماية' : activeCount < 4 ? '🟠 ضعيفة' : activeCount < 8 ? '🟡 متوسطة' : activeCount < 11 ? '🟢 جيدة' : '💎 كاملة';

            const embed = new EmbedBuilder()
                .setColor(activeCount === totalCount ? '#00FF00' : '#FF6600')
                .setTitle(`🛡️ حالة الحماية — ${interaction.guild.name}`)
                .setDescription(`> **المستوى:** ${protectLevel}\n> **\`${bar}\`** ${activeCount}/${totalCount} أنظمة مفعّلة`)
                .addFields(
                    { name: '🏠 السيرفر', value: on(protectDB.get(`anti_server_edit_${g}`)), inline: true },
                    { name: '📺 الرومات', value: on(protectDB.get(`anti_channel_edit_${g}`)), inline: true },
                    { name: '🎭 الرتب', value: on(protectDB.get(`anti_role_edit_${g}`)), inline: true },
                    { name: '🔨 الباند', value: on(protectDB.get(`ban_status_${g}`) === 'on'), inline: true },
                    { name: '👢 الكيك', value: on(protectDB.get(`anti_kick_${g}`)), inline: true },
                    { name: '🤖 البوتات', value: on(protectDB.get(`antibots_status_${g}`) === 'on'), inline: true },
                    { name: '🔗 الويب هوك', value: on(protectDB.get(`anti_webhook_${g}`)), inline: true },
                )
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('quick_setup_protection').setLabel('⚡ تفعيل الكل').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('panel_protection').setLabel('🔙 رجوع').setStyle(ButtonStyle.Secondary)
            );
            return interaction.editReply({ embeds: [embed], components: [buttons] });
        }

        // ====== PROTECTION PANEL ======
        if (interaction.customId === 'panel_protection') {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🛡️ لوحة التحكم - أنظمة الحماية')
                .setDescription([
                    '**إدارة شاملة لأنظمة حماية السيرفر**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/setup-protection` - تفعيل/تعطيل كل الأنظمة',
                    '`/protection-status` - عرض حالة الحماية',
                    '`/anti-server-edit` - حماية اسم وصورة السيرفر',
                    '`/anti-channel-create` - منع إنشاء رومات',
                    '`/anti-channel-edit` - حماية الرومات',
                    '`/anti-role-create` - منع إنشاء رتب',
                    '`/anti-role-edit` - حماية تعديل الرتب',
                    '`/anti-kick` - حماية من الكيك الجماعي',
                    '`/anti-webhook` - منع الويب هوكس',
                    '`/anti-ban` - حماية من الباند الجماعي',
                    '`/anti-bots` - حماية من البوتات',
                    '`/set-protect-logs` - تحديد روم السجلات'
                ].join('\n'))
                .addFields(
                    { name: '⚠️ ملاحظة', value: 'ارفع رتبة البوت لأعلى موضع للحماية الكاملة', inline: false }
                )
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('quick_setup_protection')
                    .setLabel('⚡ تفعيل سريع')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('quick_status_protection')
                    .setLabel('📊 عرض الحالة')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== TICKET PANEL ======
        if (interaction.customId === 'panel_ticket') {
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🎫 لوحة التحكم - نظام التكت')
                .setDescription([
                    '**إدارة نظام التذاكر والدعم**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/setup-ticket` - إعداد نظام التكت',
                    '`/add-ticket-button` - إضافة زر تكت إضافي',
                    '`/set-ticket-log` - تحديد روم سجلات التكت'
                ].join('\n'))
                .addFields(
                    { name: '💡 معلومة', value: 'يمكنك إنشاء عدة أنواع من التكتات في سيرفر واحد', inline: false }
                )
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== LOGS PANEL ======
        if (interaction.customId === 'panel_logs') {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('📋 لوحة التحكم - نظام اللوج')
                .setDescription([
                    '**تتبع جميع أحداث السيرفر**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/setup-logs` - إعداد نظام اللوج',
                    '`/logs-info` - عرض معلومات اللوج'
                ].join('\n'))
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== GIVEAWAY PANEL ======
        if (interaction.customId === 'panel_giveaway') {
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🎁 لوحة التحكم - الجيف اواي')
                .setDescription([
                    '**إدارة المسابقات والجوائز**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/giveaway-start` - بدء مسابقة جديدة',
                    '`/giveaway-end` - إنهاء مسابقة',
                    '`/giveaway-reroll` - إعادة اختيار الفائز'
                ].join('\n'))
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== BROADCAST PANEL ======
        if (interaction.customId === 'panel_broadcast') {
            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('📢 لوحة التحكم - البرودكاست')
                .setDescription([
                    '**إرسال رسائل جماعية للأعضاء**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/broadcast` - إرسال رسالة جماعية',
                    '`/broadcast-role` - إرسال لرتبة معينة'
                ].join('\n'))
                .addFields(
                    { name: '⚠️ تحذير', value: 'استخدم البرودكاست بحذر لتجنب الإزعاج', inline: false }
                )
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== TOKENS PANEL ======
        if (interaction.customId === 'panel_tokens') {
            const embed = new EmbedBuilder()
                .setColor('#FF6B00')
                .setTitle('💎 لوحة التحكم - كشف التوكنات Premium')
                .setDescription([
                    '**كشف الحسابات الوهمية والتوكنات**\n',
                    '🔒 **هذه خدمة Premium!**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/scan-tokens` - كشف الحسابات المشبوهة',
                    '`/kick-tokens` - طرد التوكنات تلقائياً\n',
                    '👑 **أوامر الأونر:**\n',
                    '`/token-premium add` - منح صلاحية',
                    '`/token-premium remove` - إزالة صلاحية',
                    '`/token-premium list` - عرض القائمة'
                ].join('\n'))
                .addFields(
                    { name: '🌐 للحصول على صلاحية', value: '[انضم لسيرفر الدعم](https://discord.gg/HC8V8cPF4)', inline: false }
                )
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 سيرفر الدعم')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/HC8V8cPF4'),
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== SETTINGS PANEL ======
        if (interaction.customId === 'panel_settings') {
            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('⚙️ لوحة التحكم - الإعدادات')
                .setDescription([
                    '**إعدادات البوت والسيرفر**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/set-language` - تغيير اللغة',
                    '`/bot-avatar` - تغيير صورة البوت',
                    '`/setup-welcome` - إعداد رسالة الترحيب',
                    '`/setup-autorole` - إعداد الرتب التلقائية'
                ].join('\n'))
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== STATS PANEL ======
        if (interaction.customId === 'panel_stats') {
            const totalServers = client.guilds.cache.size;
            const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);

            const embed = new EmbedBuilder()
                .setColor('#E91E63')
                .setTitle('📊 لوحة التحكم - الإحصائيات')
                .setDescription('**إحصائيات البوت والسيرفر**')
                .addFields(
                    { name: '🌐 السيرفرات', value: `\`${totalServers}\``, inline: true },
                    { name: '👥 المستخدمين', value: `\`${totalUsers.toLocaleString()}\``, inline: true },
                    { name: '📡 البينج', value: `\`${client.ws.ping}ms\``, inline: true },
                    { name: '⏰ وقت التشغيل', value: `\`${days}d ${hours}h ${minutes}m\``, inline: true },
                    { name: '🎭 الأعضاء في السيرفر', value: `\`${interaction.guild.memberCount}\``, inline: true },
                    { name: '📺 الرومات', value: `\`${interaction.guild.channels.cache.size}\``, inline: true }
                )
                .setFooter({ text: 'Made by king & STEVEN' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== LANGUAGE PANEL ======
        if (interaction.customId === 'panel_language') {
            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('🌐 لوحة التحكم - اللغة')
                .setDescription([
                    '**تغيير لغة ردود البوت**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/set-language` - تغيير اللغة\n',
                    '🇸🇦 **العربية** - كل الردود بالعربي',
                    '🇬🇧 **English** - كل الردود بالإنجليزي'
                ].join('\n'))
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== HELP PANEL ======
        if (interaction.customId === 'panel_help') {
            const embed = new EmbedBuilder()
                .setColor('#95A5A6')
                .setTitle('❓ لوحة التحكم - المساعدة')
                .setDescription([
                    '**كيفية استخدام البوت**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/help` - قائمة الأوامر الكاملة',
                    '`/bot-info` - معلومات البوت',
                    '`/developers` - معلومات المبرمجين',
                    '`/dashboard` - لوحة التحكم (أنت هنا)\n',
                    '🌐 **سيرفر الدعم:**',
                    'https://discord.gg/HC8V8cPF4'
                ].join('\n'))
                .setFooter({ text: 'Made by king & STEVEN' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 سيرفر الدعم')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/HC8V8cPF4'),
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== OWNER PANEL ======
        if (interaction.customId === 'panel_owner') {
            if (!isOwner) {
                return interaction.reply({ content: '❌ هذه اللوحة للأونر فقط!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('👑 لوحة التحكم - Owner Panel')
                .setDescription([
                    '**أوامر خاصة بصاحب البوت**\n',
                    '📋 **الأوامر المتاحة:**\n',
                    '`/bot-servers` - عرض جميع السيرفرات',
                    '`/token-premium` - إدارة صلاحيات التوكنات',
                    '`/owners` - عرض قائمة الأونرز',
                    '`/developers` - معلومات المبرمجين'
                ].join('\n'))
                .addFields(
                    { name: '⚠️ تحذير', value: 'هذه الأوامر قوية - استخدمها بحذر!', inline: false }
                )
                .setFooter({ text: 'Owner Panel - Access Restricted' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_main')
                    .setLabel('🔙 القائمة الرئيسية')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== PREFIX PANEL ======
        if (interaction.customId === 'panel_prefix') {
            const { Database } = require('st.db');
            const prefixDB = new Database('./Json-db/prefix.json');
            const currentPrefix = prefixDB.get(`prefix_${interaction.guild.id}`) || require('../config').prefix || '!';

            const embed = new EmbedBuilder()
                .setColor('#F39C12')
                .setTitle('⚙️ لوحة التحكم - البريفكس')
                .setDescription([
                    `**البريفكس الحالي:** \`${currentPrefix}\`\n`,
                    '📋 **كيفية التغيير:**',
                    `اكتب في الشات: \`${currentPrefix}بريفكس <البريفكس الجديد>\``,
                    `مثال: \`${currentPrefix}بريفكس .\`\n`,
                    '📋 **أوامر البريفكس المتاحة:**',
                    `\`${currentPrefix}مساعدة\` - قائمة الأوامر`,
                    `\`${currentPrefix}بريفكس\` - عرض/تغيير البريفكس`,
                    `\`${currentPrefix}حماية-تفعيل\` - تفعيل الحماية`,
                    `\`${currentPrefix}حماية-تعطيل\` - تعطيل الحماية`,
                    `\`${currentPrefix}حماية-حالة\` - حالة الحماية`,
                    `\`${currentPrefix}كلير <عدد>\` - حذف رسائل`,
                    `\`${currentPrefix}كيك <@مستخدم>\` - كيك`,
                    `\`${currentPrefix}باند <@مستخدم>\` - باند`,
                    `\`${currentPrefix}قفل\` / \`${currentPrefix}فتح\` - قفل/فتح الروم`,
                    `\`${currentPrefix}اخفاء\` / \`${currentPrefix}اظهار\` - إخفاء/إظهار الروم`,
                    `\`${currentPrefix}بينج\` - سرعة البوت`,
                    `\`${currentPrefix}سيرفر\` - معلومات السيرفر`,
                    `\`${currentPrefix}يوزر <@مستخدم>\` - معلومات مستخدم`,
                ].join('\n'))
                .setFooter({ text: 'اكتب الأمر في الشات لاستخدامه' })
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_main').setLabel('🔙 القائمة الرئيسية').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({ embeds: [embed], components: [buttons] });
        }

        // ====== BACK TO MAIN ======
        if (interaction.customId === 'panel_main') {
            // Re-execute the dashboard command
            const mainEmbed = new EmbedBuilder()
                .setColor('#00D9FF')
                .setTitle('🎛️ لوحة التحكم الرئيسية')
                .setDescription([
                    '**مرحباً بك في لوحة التحكم الشاملة!**',
                    'يمكنك التحكم في جميع أنظمة البوت من هنا.\n',
                    `👤 **المستخدم:** ${interaction.user}`,
                    `🎭 **الصلاحيات:** ${isOwner ? '👑 Owner' : isAdmin ? '⚡ Admin' : '👥 Member'}`,
                    `🌐 **السيرفر:** ${interaction.guild.name}\n`,
                    '📋 **اختر القسم الذي تريد الوصول إليه:**'
                ].join('\n'))
                .addFields(
                    { name: '🛡️ الحماية', value: 'أنظمة حماية السيرفر', inline: true },
                    { name: '🎫 التكت', value: 'نظام التذاكر', inline: true },
                    { name: '📋 اللوج', value: 'سجلات الأحداث', inline: true },
                    { name: '📢 البرودكاست', value: 'رسائل جماعية', inline: true },
                    { name: '💎 التوكنات', value: 'كشف الحسابات', inline: true },
                    { name: '⚙️ الإعدادات', value: 'إعدادات البوت', inline: true },
                    { name: '📊 الإحصائيات', value: 'إحصائيات شاملة', inline: true },
                    { name: '🌐 اللغة', value: 'تغيير اللغة', inline: true },
                    { name: '⚙️ البريفكس', value: 'تغيير البريفكس', inline: true }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Made by king & STEVEN', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const buttons1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_protection').setLabel('🛡️ الحماية').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_ticket').setLabel('🎫 التكت').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_logs').setLabel('📋 اللوج').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_broadcast').setLabel('📢 برودكاست').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('panel_settings').setLabel('⚙️ إعدادات').setStyle(ButtonStyle.Secondary),
            );

            const buttons2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_tokens').setLabel('💎 توكنات').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('panel_stats').setLabel('📊 إحصائيات').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('panel_language').setLabel('🌐 اللغة').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('panel_prefix').setLabel('⚡ البريفكس').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('panel_owner').setLabel('👑 Owner').setStyle(ButtonStyle.Danger),
            );

            const buttons3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('panel_help').setLabel('❓ المساعدة').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setLabel('🌐 سيرفر الدعم').setStyle(ButtonStyle.Link).setURL('https://discord.gg/HC8V8cPF4'),
            );

            await interaction.update({ embeds: [mainEmbed], components: [buttons1, buttons2, buttons3] });
        }
    });
};
