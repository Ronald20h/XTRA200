// Ticket System Handler - Enhanced Version
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require("discord.js");
const { Database } = require("st.db");
const ticketDB = new Database('./Json-db/Bots/ticketDB.json');

module.exports = async (client) => {
    // Handle ticket creation button
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'create_ticket') return;

        try {
            await interaction.deferReply({ ephemeral: true });

            const settings = ticketDB.get(`TicketSettings_${interaction.guild.id}`);
            if (!settings) {
                return interaction.editReply({ content: '❌ لم يتم إعداد نظام التكت بعد. استخدم `/setup-ticket`' });
            }

            // Check if user already has an open ticket
            const existingTickets = interaction.guild.channels.cache.filter(c => 
                c.name === `ticket-${interaction.user.username.toLowerCase()}`
            );

            if (existingTickets.size > 0) {
                return interaction.editReply({ 
                    content: `❌ لديك تكت مفتوح بالفعل: ${existingTickets.first()}` 
                });
            }

            // Create ticket channel
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: settings.categoryId || null,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks
                        ]
                    },
                    {
                        id: settings.supportRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels
                        ]
                    }
                ]
            });

            // Save ticket info
            ticketDB.set(`TICKET-PANEL_${ticketChannel.id}`, {
                author: interaction.user.id,
                Support: settings.supportRoleId,
                createdAt: Date.now(),
                guildId: interaction.guild.id
            });

            // Send welcome message in ticket
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎫 تكت جديد')
                .setDescription(`مرحباً ${interaction.user}! شكراً لفتح تكت.\n\nسيتم الرد عليك قريباً من قبل فريق الدعم.`)
                .addFields(
                    { name: '👤 تم الفتح بواسطة', value: `${interaction.user}`, inline: true },
                    { name: '🕐 الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: '📋 التعليمات', value: 'اكتب مشكلتك أو استفسارك بالتفصيل', inline: false }
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Made by STEVEN' })
                .setTimestamp();

            const ticketButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 إغلاق التكت')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('✋ المطالبة بالتكت')
                    .setStyle(ButtonStyle.Success)
            );

            await ticketChannel.send({ 
                content: `${interaction.user} <@&${settings.supportRoleId}>`,
                embeds: [welcomeEmbed],
                components: [ticketButtons]
            });

            // Notify user
            await interaction.editReply({ 
                content: `✅ تم فتح تكت جديد: ${ticketChannel}`,
            });

        } catch (error) {
            console.error('[create_ticket]', error);
            await interaction.editReply({ content: '❌ حدث خطأ أثناء إنشاء التكت.' }).catch(() => {});
        }
    });

    // Handle close ticket button
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket') return;

        try {
            await interaction.deferReply({ ephemeral: false });

            const ticket = ticketDB.get(`TICKET-PANEL_${interaction.channel.id}`);
            if (!ticket) {
                return interaction.editReply({ content: '❌ هذه القناة ليست تكت.' });
            }

            const closeEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 إغلاق التكت')
                .setDescription(`سيتم حذف هذا التكت خلال 5 ثواني...`)
                .addFields(
                    { name: '🔒 تم بواسطة', value: `${interaction.user}`, inline: true },
                    { name: '⏰ الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'Made by STEVEN' })
                .setTimestamp();

            await interaction.editReply({ embeds: [closeEmbed] });

            // Log to log channel if set
            const logChannelId = ticketDB.get(`LogsRoom_${interaction.guild.id}`);
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('📋 سجل إغلاق تكت')
                        .addFields(
                            { name: '🎫 التكت', value: `${interaction.channel.name}`, inline: true },
                            { name: '👤 المالك', value: `<@${ticket.author}>`, inline: true },
                            { name: '🔒 أغلق بواسطة', value: `${interaction.user}`, inline: true }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            setTimeout(async () => {
                ticketDB.delete(`TICKET-PANEL_${interaction.channel.id}`);
                await interaction.channel.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('[close_ticket]', error);
        }
    });

    // Handle claim ticket button
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'claim_ticket') return;

        try {
            await interaction.deferReply({ ephemeral: false });

            const claimEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✋ تم المطالبة بالتكت')
                .setDescription(`${interaction.user} سيتولى التعامل مع هذا التكت`)
                .setFooter({ text: 'Made by STEVEN' })
                .setTimestamp();

            await interaction.editReply({ embeds: [claimEmbed] });

        } catch (error) {
            console.error('[claim_ticket]', error);
        }
    });
};
