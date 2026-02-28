const { Client, Collection, discord,GatewayIntentBits, ChannelType, AuditLogEvent , Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const moment = require('moment');
const { protectDB, logsDB, taxDB, autolineDB, suggestionsDB, feedbackDB, systemDB, shortcutDB, broadcastDB: db } = require('./database');
const ms = require('ms')
const { Database } = require("st.db")

const { PermissionsBitField } = require('discord.js')









// ✅ استخدام db-manager المركزي
const { 
  nadekoDB, one4allDB, ticketDB, azkarDB,
  tokenDB, autoEmojiDB, levelDB, prefixDB
} = require('./db-manager');


const path = require('path');
const { readdirSync } = require("fs");
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord-api-types/v10');
const { token, clientId, owner, owners, prefix } = require('./config.js');
  theowner = owner;
  // دعم الأونرز المتعدد
  const botOwners = owners || [owner];
  const isOwner = (userId) => botOwners.includes(userId);
  
  const client27 = new Client({intents: 131071 , shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
  client27.commands = new Collection();
  require(`./handlers/events`)(client27);
  client27.events = new Collection();
  const rest = new REST({ version: '10' }).setToken(token);
  client27.setMaxListeners(1000)

  client27.on("ready" , async() => {

      try {
        await rest.put(
          Routes.applicationCommands(client27.user.id),
          { body: one4allSlashCommands },
          );
          
        } catch (error) {
          console.error(error)
        }

    });
             

  //------------- التحقق من وقت البوت --------------//

    require("./handlers/suggest")(client27)
    require('./handlers/tax4bot')(client27)
    require("./handlers/autorole")(client27)
;
    require(`./handlers/claim`)(client27);
    require(`./handlers/close`)(client27);
    require(`./handlers/create`)(client27);
    require(`./handlers/reset`)(client27);
    require('./handlers/ticket-system')(client27);
    require('./handlers/dashboard-panels')(client27);
    require(`./handlers/support-panel`)(client27);
    require(`./handlers/prefix-commands`)(client27);
    require(`./handlers/logs-system`)(client27);
    require(`./handlers/applyCreate`)(client27)
    require(`./handlers/applyResult`)(client27)
    require(`./handlers/applySubmit`)(client27)
    require(`./handlers/addToken`)(client27)
    require(`./handlers/info`)(client27)
    require(`./handlers/sendBroadcast`)(client27)
    require(`./handlers/setBroadcastMessage`)(client27)
    require(`./handlers/welcome-system`)(client27)
    require(`./handlers/level-system`)(client27)
    require(`./handlers/ai-system`)(client27)

  const folderPath = path.join(__dirname, 'slashcommand27');
  client27.one4allSlashCommands = new Collection();
  const one4allSlashCommands = [];
  const ascii = require("ascii-table");
  const table = new ascii("one4all commands").setJustify();
  for (let folder of readdirSync(folderPath).filter(
    (folder) => !folder.includes(".")
    )) {
      for (let file of readdirSync(`${folderPath}/` + folder).filter((f) =>
      f.endsWith(".js")
      )) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
          one4allSlashCommands.push(command.data.toJSON());
          client27.one4allSlashCommands.set(command.data.name, command);
          if (command.data.name) {
            table.addRow(`/${command.data.name}`, "🟢 Working");
          } else {
            table.addRow(`/${command.data.name}`, "🔴 Not Working");
          }
        }
  }
}



const folderPath2 = path.join(__dirname, 'slashcommand27');

for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
  for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
    const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
  }
}


	for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
		const event = require(`./events/${file}`);
	if (event.once) {
		client27.once(event.name, (...args) => event.execute(...args));
	} else {
		client27.on(event.name, (...args) => event.execute(...args));
	}
	}



  client27.on("interactionCreate" , async(interaction) => {
    // Handle autocomplete
    if (interaction.isAutocomplete()) {
      const command = client27.one4allSlashCommands.get(interaction.commandName);
      if (command && command.autocomplete) {
        try { await command.autocomplete(interaction); } catch (e) { console.error('[autocomplete]', e); }
      }
      return;
    }
    if (interaction.isChatInputCommand()) {
      
	    if(interaction.user.bot) return;

      
      const command = client27.one4allSlashCommands.get(interaction.commandName);
	    
      if (!command) {
        return;
      }
      if (command.ownersOnly === true) {
        if (!isOwner(interaction.user.id)) {
          return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
        }
      }
        if (command.adminsOnly === true) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: `❗ ***يجب أن تمتلك صلاحية الأدمن لاستخدام هذا الأمر***`, ephemeral: true });
            }
            // Check if user's role is higher than bot's role
            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            const botHighestRole = botMember.roles.highest.position;
            const userHighestRole = interaction.member.roles.highest.position;
            if (userHighestRole <= botHighestRole && interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: `❗ ***رتبتك يجب أن تكون أعلى من رتبة البوت لاستخدام هذا الأمر***`, ephemeral: true });
            }
        }
      try {

        await command.execute(interaction);
      } catch (error) {
			return console.log("🔴 | error in one4all bot" , error)
		}
    }
  } )

  //-------------------------- جميع الاكواد هنا ----------------------//


process.on('uncaughtException', (err) => {
  console.log(err)
});
process.on('unhandledRejection', (reason, promise) => {
 console.log(reason)
});
 process.on("uncaughtExceptionMonitor", (reason) => { 
	console.log(reason)
});


  client27.on("ready" , async() => {
    let theguild = client27.guilds.cache.first();

  
  })

  //------------- نظام الأذكار التلقائي --------------//
  const azkarList = [
    "سبحان الله وبحمده، سبحان الله العظيم", "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
    "اللهم صل وسلم على نبينا محمد", "استغفر الله العظيم واتوب اليه", "لا حول ولا قوة إلا بالله",
    "سبحان الله والحمد لله ولا إله إلا الله والله أكبر", "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
    "اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعملاً متقبلاً", "رب اغفر لي ولوالدي ولجميع المسلمين",
    "اللهم إني أعوذ بك من الهم والحزن", "اللهم إني أسألك الهدى والتقى والعفاف والغنى",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة", "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
    "اللهم إني أعوذ بك من العجز والكسل", "اللهم اغفر للمؤمنين والمؤمنات والمسلمين والمسلمات الأحياء منهم والأموات",
    "اللهم أصلح لي ديني الذي هو عصمة أمري", "يا حي يا قيوم برحمتك أستغيث",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين", "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
    "اللهم أعني على ذكرك وشكرك وحسن عبادتك", "سبحان الله عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته"
  ];

  client27.on("ready", () => {
    setInterval(async () => {
      const currentTime = Date.now();
      
      client27.guilds.cache.forEach(async (guild) => {
        const enabled = azkarDB.get(`azkar_enabled_${guild.id}`);
        const channelId = azkarDB.get(`azkar_channel_${guild.id}`);
        const embedMode = azkarDB.get(`azkar_embed_${guild.id}`) !== false;
        const intervalMinutes = azkarDB.get(`azkar_interval_${guild.id}`) || 30;
        const lastSent = azkarDB.get(`azkar_last_sent_${guild.id}`) || 0;
        
        const timeSinceLastSent = currentTime - lastSent;
        const intervalMs = intervalMinutes * 60 * 1000;
        
        if (enabled && channelId && timeSinceLastSent >= intervalMs) {
          const channel = guild.channels.cache.get(channelId);
          if (channel) {
            const randomZekr = azkarList[Math.floor(Math.random() * azkarList.length)];
            
            try {
              if (embedMode) {
                const embed = new EmbedBuilder()
                  .setColor('#00CED1')
                  .setTitle('📿 ذِكر')
                  .setDescription(randomZekr)
                  .setFooter({ text: 'Made by STEVEN' })
                  .setTimestamp();
                
                await channel.send({ embeds: [embed] });
              } else {
                await channel.send(`📿 **${randomZekr}**`);
              }
              
              azkarDB.set(`azkar_last_sent_${guild.id}`, currentTime);
            } catch (error) {
              console.error(`Error sending azkar in guild ${guild.id}:`, error);
            }
          }
        }
      });
    }, 60000); // Check every minute
  });

client27.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ====== نظام حفظ الإيموجيات من السيرفرات الثانية ======
  if (message.guild) {
    const stealRoomId = autoEmojiDB.get(`emoji_steal_room_${message.guild.id}`);
    
    if (stealRoomId && message.channel.id === stealRoomId) {
      // Find custom emojis from OTHER servers in the message
      const customEmojiRegex = /<a?:(\w+):(\d+)>/g;
      let match;
      const emojisToSteal = [];

      while ((match = customEmojiRegex.exec(message.content)) !== null) {
        const emojiName = match[1];
        const emojiId = match[2];
        const isAnimated = match[0].startsWith('<a:');

        // Check if emoji already exists in this server
        const alreadyExists = message.guild.emojis.cache.some(e => e.id === emojiId);
        if (!alreadyExists) {
          emojisToSteal.push({ name: emojiName, id: emojiId, animated: isAnimated });
        }
      }

      if (emojisToSteal.length > 0) {
        const added = [];
        const failed = [];

        for (const emoji of emojisToSteal) {
          try {
            const ext = emoji.animated ? 'gif' : 'png';
            const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}`;
            
            await message.guild.emojis.create({
              attachment: url,
              name: emoji.name,
              reason: `تم حفظه من رسالة ${message.author.tag}`
            });
            added.push(emoji);
          } catch (err) {
            failed.push(emoji);
          }
        }

        if (added.length > 0) {
          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ تم حفظ الإيموجيات!')
            .setDescription(
              added.map(e => `${e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`} \`${e.name}\``).join('\n')
            )
            .addFields(
              { name: '✅ تم حفظها', value: `\`${added.length}\``, inline: true },
              { name: '❌ فشل', value: `\`${failed.length}\``, inline: true },
            )
            .setFooter({ text: `أضافها: ${message.author.tag}` })
            .setTimestamp();

          message.reply({ embeds: [embed] });
        }
      }
    }
  }

  let roomid = taxDB.get(`tax_room_${message.guild.id}`);
  let taxLine = taxDB.get(`tax_line_${message.guild.id}`);
  let taxMode = taxDB.get(`tax_mode_${message.guild.id}`) || 'embed'; 
  let taxColor = taxDB.get(`tax_color_${message.guild.id}`) || '#0099FF'; 

  if (roomid) {
    if (message.channel.id === roomid) {
      if (message.author.bot) return;

      let number = message.content;

      if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
      else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
      else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
      else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

      if (isNaN(number) || number == 0) return message.delete();

      let number2 = parseInt(number); // المبلغ
      let tax = Math.floor(number2 * 20 / 19 + 1); // المبلغ مع الضريبة
      let tax2 = Math.floor(tax - number2); // الضريبة
      let tax3 = Math.floor(tax * 20 / 19 + 1); // المبلغ مع ضريبة الوسيط
      let tax4 = Math.floor(number2 * 0.02); // نسبة الوسيط
      let tax5 = Math.floor(tax3 + tax4); // الضريبة كاملة مع نسبة الوسيط

      let description = `
🪙 المبلغ ** : ${number2}**
- ضريبة برو بوت **: ${tax}**
- المبلغ كامل مع ضريبة الوسيط **: ${tax3}**
- نسبة الوسيط 2 % **: ${tax4}**
- الضريبة كاملة مع نسبة الوسيط **: ${tax5}**
`;

      let btn1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tax_${tax}`)
          .setLabel('Tax')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`mediator_${tax5}`)
          .setLabel('Mediator')
          .setStyle(ButtonStyle.Secondary)
      );

      if (taxMode === 'embed') {
        let embed1 = new EmbedBuilder()
          .setColor(taxColor)
          .setDescription(description)
          .setThumbnail(message.guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [embed1], components: [btn1] });

        if (taxLine) {
          message.channel.send({ files: [taxLine] });
        }
      } else {
        message.reply({ content: description, components: [btn1] });

        if (taxLine) {
          message.channel.send({ files: [taxLine] });
        }
      }

      return;
    }
  }
});

  
client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const line = autolineDB.get(`line_${message.guild.id}`);
  const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

  if (message.content === "-" || message.content === "خط") {
    if (line && message.member.permissions.has('ManageMessages')) {
      await message.delete();
      if (lineMode === 'link') {
        return message.channel.send({ content: `${line}` });
      } else if (lineMode === 'image') {
        return message.channel.send({ files: [line] });
      }
    }
  }
});
  
client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const autoChannels = autolineDB.get(`line_channels_${message.guild.id}`);
  if (autoChannels) {
    if (autoChannels.length > 0) {
      if (autoChannels.includes(message.channel.id)) {
        const line = autolineDB.get(`line_${message.guild.id}`);
        const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

        if (line) {
          if (lineMode === 'link') {
            return message.channel.send({ content: `${line}` });
          } else if (lineMode === 'image') {
            return message.channel.send({ files: [line] });
          }
        }
      }
    }
  }
});

client27.on('messageCreate', async message => {
    if (message.author.bot) return;

    if(message.content == `قيمني`) {
        const designer = message.author;
        const designRole = 'ايدي الاداره';
        if (!message.member.roles.cache.has(designRole)) {
            return; 
        }

        const filter = response => !response.author.bot && response.author.id !== designer.id;

        message.channel.send(`من فضلك أكتب تقييمك لخدمه برمجيه <@${designer.id}>`).then(() => {
            message.channel.awaitMessages({ filter, max: 1, errors: ['time'] })
                .then(async collected => {

                    const user = collected.first().author; 
                    const userText = collected.first().content;
                    const rankroom = 'ايدي روم التقييم';

                    const st1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Primary)
                        );

                    await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i => !i.user.bot && i.user.id !== designer.id;
                    const collector = message.channel.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

                    collector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;

                        let embedDescription;
                        switch (interaction.customId) {
                            case '1star':
                                embedDescription = '⭐';
                                break;
                            case '2star':
                                embedDescription = '⭐⭐';
                                break;
                            case '3star':
                                embedDescription = '⭐⭐⭐';
                                break;
                            case '4star':
                                embedDescription = '⭐⭐⭐⭐';
                                break;
                            case '5star':
                                embedDescription = '⭐⭐⭐⭐⭐';
                                break;
                        }

                        const embedrank = new EmbedBuilder()
                            .setDescription(`${userText}\n**عدد النجوم:**\n${embedDescription}`)
                            .setColor('#808080')
                            .setAuthor({
                                name: user.username,
                                iconURL: user.displayAvatarURL()
                            });

                        const rankChannel = client27.channels.cache.get(rankroom);
                        if (rankChannel) {
                            await rankChannel.send({ content: `المبرمج: <@${designer.id}>`, embeds: [embedrank] });
                            await interaction.reply({ content: 'تم إرسال تقييمك بنجاح، نشكرك لاستعمال خدماتنا', ephemeral: true });
                        } else {
                            await interaction.reply({ content: 'حدث خطأ، روم التقييم غير موجود.', ephemeral: true });
                        }
                            await interaction.message.delete();

                        collector.stop();
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            message.channel.send('لم يتم تلقي أي تقييمات.');
                        }
                    });
                })
                .catch(error => {
                    console.error('Error collecting messages: ', error);
                    message.channel.send('انتهى الوقت، لا يمكنك التقييم.');
                });
        });
    }
});

client27.on('messageCreate', async message => {
  if (message.author.bot) return;

if (message.content.startsWith(`${prefix}obc`) || message.content.startsWith(`${prefix}bc`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ليس لديك الصلاحيات اللازمة لاستخدام هذا الأمر.');
    }

    const args = message.content.split(' ').slice(1);
    const broadcastMsg = args.join(' ');
    if (!broadcastMsg) {
      return message.reply('يرجى كتابة رسالة بعد الأمر.');
    }

    await message.guild.members.fetch();
    let allMembers = message.guild.members.cache.filter(member => !member.user.bot);

    if (message.content.startsWith(`${prefix}obc`)) {
      allMembers = allMembers.filter(mem =>
        mem.presence?.status === 'online' ||
        mem.presence?.status === 'dnd' ||
        mem.presence?.status === 'idle' ||
        mem.presence?.activities.some(activity => activity.type === ActivityType.Streaming)
      );
    }

    allMembers = allMembers.map(mem => mem.user.id);

    const thetokens = db.get(`tokens_${message.guild.id}`) || [];
    const botsNum = thetokens.length;
    const membersPerBot = Math.floor(allMembers.length / botsNum);
    const submembers = [];
    for (let i = 0; i < allMembers.length; i += membersPerBot) {
      submembers.push(allMembers.slice(i, i + membersPerBot));
    }
    if (submembers.length > botsNum) {
      submembers.pop();
    }

    let donemembers = 0;
    let faildmembers = 0;

    const embed = new EmbedBuilder()
      .setTitle('📢 بدء إرسال البرودكاست')
      .setColor('Aqua')
      .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

    const msg = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < submembers.length; i++) {
      const token = thetokens[i];
      let clienter = new Client({ intents: 131071 });
      await clienter.login(token);

      submembers[i].forEach(async (sub) => {
        try {
          const user = await clienter.users.fetch(sub);
          await user.send(`${broadcastMsg}\n<@${sub}>`);
          donemembers++;

        } catch (error) {
          faildmembers++;
        }

        const progressEmbed = new EmbedBuilder()
          .setTitle('📢 تحديث حالة البرودكاست')
          .setColor('Aqua')
          .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

        await msg.edit({ embeds: [progressEmbed] });

        if (donemembers + faildmembers >= allMembers.length) {
          const finalEmbed = new EmbedBuilder()
            .setTitle('✅ تم الانتهاء من إرسال البرودكاست')
            .setColor('Green')
            .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

          await msg.edit({ embeds: [finalEmbed] });
        }
      });
    }
  }
});

client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`rate_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
  if (message.content === `${prefix}تقييم` || message.content === `${cmd}`) {
        const stafer = message.author;
        const staffRole = await feedbackDB.get(`staff_role_${message.guild.id}`);  
        if (!message.member.roles.cache.has(staffRole)) {
            return; 
        }

        const filter = response => !response.author.bot && response.author.id !== stafer.id;

        message.channel.send(`من فضلك أكتب تقييمك للاداري <@${stafer.id}>`).then(() => {
            message.channel.awaitMessages({ filter, max: 1, errors: ['time'] })
                .then(async collected => {

                    const user = collected.first().author; 
                    const userText = collected.first().content;
                    const rankroom = feedbackDB.get(`rank_room_${message.guild.id}`);

                    const st1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Success),
                            new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Success)
                        );

                    await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i => !i.user.bot && i.user.id !== stafer.id;
                    const collector = message.channel.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

                    collector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;

                        let embedDescription;
                        switch (interaction.customId) {
                            case '1star':
                                embedDescription = '⭐';
                                break;
                            case '2star':
                                embedDescription = '⭐⭐';
                                break;
                            case '3star':
                                embedDescription = '⭐⭐⭐';
                                break;
                            case '4star':
                                embedDescription = '⭐⭐⭐⭐';
                                break;
                            case '5star':
                                embedDescription = '⭐⭐⭐⭐⭐';
                                break;
                        }

                        const embedrank = new EmbedBuilder()
                            .setDescription(`${userText}\n**عدد النجوم:**\n${embedDescription}`)
                            .setColor('Random')
                            .setAuthor({
                                name: user.username,
                                iconURL: user.displayAvatarURL()
                            });

                        const rankChannel = client27.channels.cache.get(rankroom);
                        if (rankChannel) {
                            await rankChannel.send({ content: `الاداري: <@${stafer.id}>`, embeds: [embedrank] });
                            await interaction.reply({ content: 'تم إرسال تقييمك بنجاح، نشكرك لاستعمال خدماتنا', ephemeral: true });
                        } else {
                            await interaction.reply({ content: 'حدث خطأ، روم التقييم غير موجود.', ephemeral: true });
                        }
                            await interaction.message.delete();

                        collector.stop();
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            message.channel.send('لم يتم تلقي أي تقييمات.');
                        }
                    });
                })
                .catch(error => {
                    console.error('Error collecting messages: ', error);
                    message.channel.send('انتهى الوقت، لا يمكنك التقييم.');
                });
        });
    }
});

client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const line = suggestionsDB.get(`line_${message.guild.id}`);
  const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`);
  const suggestionMode = suggestionsDB.get(`suggestion_mode_${message.guild.id}`) || 'buttons'; // Default to buttons if not set
  const threadMode = suggestionsDB.get(`thread_mode_${message.guild.id}`) || 'enabled'; // Default to enabled if not set

  if (chan) {
    if (message.channel.id !== chan) return;
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (suggestionMode === 'buttons') {
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Success);
      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(button1, button2);
      let send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => { return; });

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      await suggestionsDB.set(`${send.id}_ok`, 0);
      await suggestionsDB.set(`${send.id}_no`, 0);
      return message.delete();
    } else if (suggestionMode === 'reactions') {
      let send = await message.channel.send({ embeds: [embed] }).catch(() => { return; });
      await send.react('✔️');
      await send.react('❌');

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      return message.delete();
    }
  }
});

client27.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const line = feedbackDB.get(`line_${message.guild.id}`);
  const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
  const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed'; 
  const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || "❤"; 

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip:**`, embeds: [embed] });
      await themsg.react("❤");
      await themsg.react("❤️‍🔥");
      if (line) {
        await message.channel.send({ files: [line] });
      }
    } else if (feedbackMode === 'reactions') {
      await message.react(feedbackEmoji);
      if (line) {
        await message.channel.send({ files: [line] });
      }
    }
  }
});

client27.on('messageCreate', async message => {
    if (message.author.bot) return;
  if(message.content == `${prefix}close`) {
        const supportRoleID = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;

   /*     if (!message.member.roles.cache.has(supportRoleID)) {
            return message.reply({ content: ':x: You do not have permission to close this ticket.', ephemeral: true });
        }*/

        const ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);

        await message.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false });

        const embed2 = new EmbedBuilder()
            .setDescription(`تم اغلاق تذكرة بواسطة ${message.author}`)
            .setColor("Yellow");

        const embed = new EmbedBuilder()
            .setDescription("```لوحة فريق الدعم.```")
            .setColor("DarkButNotBlack");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ embeds: [embed2, embed], components: [row] });

        const logsRoomId = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logsRoomId);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle('Close Ticket')
                .addFields(
                    { name: 'Name Ticket', value: `${message.channel.name}` },
                    { name: 'Owner Ticket', value: `${ticket.author}` },
                    { name: 'Closed By', value: `${message.author}` },
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
});


client27.on('messageCreate', async message => {
    const supportRoleId = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;
    if (message.author.bot) return;
  if(message.content == `${prefix}delete`) {
        if (!message.member.roles.cache.has(supportRoleId)) {
            message.reply({ content: ':x: Only Support', ephemeral: true });
            return;
        }

        if (!ticketDB.has(`TICKET-PANEL_${message.channel.id}`)) {
            message.reply({ content: 'This channel isn\'t a ticket', ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Ticket will be deleted in a few seconds');
        await message.reply({ embeds: [embed] });

        setTimeout(() => {
            message.channel.delete();
        }, 4500);

        const Logs = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const Log = message.guild.channels.cache.get(Logs);
        const Ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('Delete Ticket')
            .addFields(
                { name: 'Name Ticket', value: `${message.channel.name}` },
                { name: 'Owner Ticket', value: `${Ticket.author}` },
                { name: 'Deleted By', value: `${message.author}` },
            )
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

        Log?.send({ embeds: [logEmbed] });
        ticketDB.delete(`TICKET-PANEL_${message.channel.id}`);
    }
});

client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}say`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const content = message.content.slice(`${prefix}say`.length).trim();
        if (!content) {
            message.channel.send("من فضلك اكتب شيئا بعد الأمر.");
            return;
        }
        let image = null;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }

        await message.delete();

        await message.channel.send({ 
            content: content, 
            files: image ? [image] : [] 
        });
    }
});

client27.on('messageCreate', async message => {
  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}clear`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const args = message.content.split(' ').slice(1);
        const amount = args[0] ? parseInt(args[0]) : 99;
        if (isNaN(amount) || amount <= 0 || amount > 100) return;
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
            const messagesToDelete = fetchedMessages.filter(msg => {
                const fourteenDays = 14 * 24 * 60 * 60 * 1000;
                return (Date.now() - msg.createdTimestamp) < fourteenDays;
            });
            await message.channel.bulkDelete(messagesToDelete);
        } catch (error) {
        }
    }
});


client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null; 
    if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith(`${cmd}`)) {
        const args = message.content.startsWith(`${prefix}tax`) 
            ? message.content.slice(`${prefix}tax`.length).trim() 
            : message.content.slice(`${cmd}`.length).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (isNaN(number2)) {
            return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
        }

        let tax = Math.floor(number2 * (20) / (19) + 1); // الضريبة
        let tax2 = Math.floor(tax - number2); // المبلغ مع الضريبة

        await message.reply(`${tax}`);
    }
});

client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
        }
        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);
        if (!targetMember) {
            return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
        }
        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;
        try {
            await targetMember.send(directMessageContent);
            await message.reply('**تم الارسال للشخص بنجاح**');
        } catch (error) {
            await message.reply('**لم استطع الارسال للشخص**');
        }
    }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
            }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      
      return message.reply({ content: `**${message.channel} has been locked**` });
    } catch (error) {
      message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
      console.log(error);
    }
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply({ content: `**${message.channel} has been unlocked**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply({ content: `**${message.channel} has been hidden**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply({ content: `**${message.channel} has been unhidded**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || message.content === `${cmd}`) {
    const embedser = new EmbedBuilder()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor('Random')
      .addFields(
        {
          name: `**🆔 Server ID:**`, 
          value: message.guild.id, 
          inline: false
        },
        {
          name: `**📆 Created On:**`, 
          value: `**<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>**`, 
          inline: false
        },
        {
          name: `**👑 Owned By:**`, 
          value: `**<@${message.guild.ownerId}>**`, 
          inline: false
        },
        {
          name: `**👥 Members (${message.guild.memberCount})**`, 
          value: `**${message.guild.premiumSubscriptionCount} Boosts ✨**`, 
          inline: false
        },
        {
          name: `**💬 Channels (${message.guild.channels.cache.size})**`, 
          value: `**${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size}** Text | **${
              message.guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size
            }** Voice | **${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildCategory).size}** Category`,
          inline: false
        },
        {
          name: '🌍 Others',
          value: `**Verification Level:** ${message.guild.verificationLevel}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.reply({ embeds: [embedser] });
  }
});


  // بداية الحماية من البوتات
client27.on("guildMemberAdd" , async(member) => {
  if(protectDB.has(`antibots_status_${member.guild.id}`)) {
    let antibotsstatus = protectDB.get(`antibots_status_${member.guild.id}`)
    if(antibotsstatus == "on") {
      if(member.user.bot) {
        try {
          const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
          if(logRoom){
            const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
            theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `نظام الحماية من البوتات`} , {name : `العقاب :` , value : `طرد البوت`})]})
          }
          member.kick()
        } catch(err){
          return console.log('error' , err);
        }
      }
    }
  }
})
// نهاية الحماية من البوتات

//-

// بداية الحماية من حذف الرومات
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`roomsdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`roomsdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleterooms_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('channelDelete' , async(channel) => {
  let guildid = channel.guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const _roles_ch_old = await getMemberRoles(channel.guild, executor.id);
  if (isWhitelisted(guildid, executor.id, client27.user.id, 'channel', _roles_ch_old)) return;
  const users = protectDB.get(`roomsdelete_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`roomsdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`roomsdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`antideleterooms_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حذف رومات`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`roomsdelete_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`roomsdelete_users_${guildid}` , users)
  }
})
// نهاية الحماية من حذف الرومات

//-

// بداية الحماية من حذف الرتب
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`rolesdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleteroles_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('roleDelete' , async(role) => {
  let guildid = role.guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const _roles_rl_old = await getMemberRoles(role.guild, executor.id);
  if (isWhitelisted(guildid, executor.id, client27.user.id, 'role', _roles_rl_old)) return;
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
  const e
