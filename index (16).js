
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
  if (await isAboveBot(channel.guild, executor.id)) return;
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
  if (await isAboveBot(role.guild, executor.id)) return;
  if (isWhitelisted(guildid, executor.id, client27.user.id, 'role', _roles_rl_old)) return;
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`rolesdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`rolesdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`antideleteroles_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حذف رتب`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`rolesdelete_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`rolesdelete_users_${guildid}` , users)
  }
})

// نهاية الحماية من حذف الرتب

//-

// بداية الحماية من البان
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`ban_users_${guildid}`)
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
      await protectDB.set(`ban_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`ban_limit_${guildid}`)
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

client27.on('guildBanAdd' , async(member) => {
  let guildid = member.guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const _roles_ban = await getMemberRoles(member.guild, executor.id);
  if (await isAboveBot(member.guild, executor.id)) return;
  if (isWhitelisted(guildid, executor.id, client27.user.id, 'ban', _roles_ban)) return;
  const users = protectDB.get(`ban_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`ban_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حظر اعضاء`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`ban_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`ban_users_${guildid}` , users)
  }
})

client27.on('guildMemberRemove' , async(member) => {
  let guildid = member.guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  if(member.id === client27.user.id) return;
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const _roles_kick_old = await getMemberRoles(member.guild, executor.id);
  if (await isAboveBot(member.guild, executor.id)) return;
  if (isWhitelisted(guildid, executor.id, client27.user.id, 'kick', _roles_kick_old)) return;
  const users = protectDB.get(`ban_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`ban_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `طرد اعضاء`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`ban_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`ban_users_${guildid}` , users)
  }
})

// نهاية الحماية من البان

client27.on('messageDelete' , async(message) => {
  if(!message) return;
  if(!message.author) return;
  if(message.author.bot) return;
if (!logsDB.has(`log_messagedelete_${message.guild.id}`)) return;
let deletelog1 = logsDB.get(`log_messagedelete_${message.guild.id}`)
  let deletelog2 = message.guild.channels.cache.get(deletelog1)
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MessageDelete
  });
  const deletionLog = fetchedLogs.entries.first();
  const { executor, target } = deletionLog;
let deleteembed = new EmbedBuilder()
.setTitle(`**تم حذف رسالة**`)
    .addFields(
      {
        name: `**صاحب الرسالة : **`, value: `**\`\`\`${message.author.tag} - (${message.author.id})\`\`\`**`, inline: false
      },
      {
        name: `**حاذف الرسالة : **`, value: `**\`\`\`${executor.username} - (${executor.id})\`\`\`**`, inline: false
      },
      {
        name: `**محتوى الرسالة : **`, value: `**\`\`\`${message.content}\`\`\`**`, inline: false
      },
      {
        name: `**الروم الذي تم الحذف فيه : **`, value: `${message.channel}`, inline: false
      }
    )
    .setTimestamp();
  await deletelog2.send({ embeds: [deleteembed] })
})
client27.on('messageUpdate' , async(oldMessage, newMessage) => {
if(!oldMessage.author) return;
if(oldMessage.author.bot) return;
if (!logsDB.has(`log_messageupdate_${oldMessage.guild.id}`)) return;
const fetchedLogs = await oldMessage.guild.fetchAuditLogs({
limit: 1,
type: AuditLogEvent.MessageUpdate
});
let updateLog1 = logsDB.get(`log_messageupdate_${oldMessage.guild.id}`);
  let updateLog2 = oldMessage.guild.channels.cache.get(updateLog1); 
const updateLog = fetchedLogs.entries.first();
const { executor } = updateLog;
let updateEmbed = new EmbedBuilder()
.setTitle(`**تم تعديل رسالة**`)
.addFields(
{
  name: "**صاحب الرسالة:**",
  value: `**\`\`\`${oldMessage.author.tag} (${oldMessage.author.id})\`\`\`**`,
  inline: false
},
{
  name: "**المحتوى القديم:**",
  value: `**\`\`\`${oldMessage.content}\`\`\`**`,
  inline: false
},
{
  name: "**المحتوى الجديد:**",
  value: `**\`\`\`${newMessage.content}\`\`\`**`,
  inline: false
},
{
  name: "**الروم الذي تم التحديث فيه:**",
  value: `${oldMessage.channel}`,
  inline: false
}
)
.setTimestamp()
await updateLog2.send({ embeds: [updateEmbed] });
})
client27.on('roleCreate' , async(role) => {
if (!logsDB.has(`log_rolecreate_${role.guild.id}`)) return;
let roleCreateLog1 = logsDB.get(`log_rolecreate_${role.guild.id}`);
  let roleCreateLog2 = role.guild.channels.cache.get(roleCreateLog1);
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleCreate
  });
  const roleCreateLog = fetchedLogs.entries.first();
  const { executor } = roleCreateLog;
  let roleCreateEmbed = new EmbedBuilder()
    .setTitle('**تم انشاء رتبة**')
    .addFields(
      { name: 'اسم الرتبة :', value: `\`\`\`${role.name}\`\`\``, inline: true },
      { name: 'الذي قام بانشاء الرتبة :', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
    )
    .setTimestamp();
  await roleCreateLog2.send({ embeds: [roleCreateEmbed] });
})
client27.on('roleDelete' , async(role) => {
if (!logsDB.has(`log_roledelete_${role.guild.id}`)) return;
let roleDeleteLog1 = logsDB.get(`log_roledelete_${role.guild.id}`);
  let roleDeleteLog2 = role.guild.channels.cache.get(roleDeleteLog1);
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete
  });

  const roleDeleteLog = fetchedLogs.entries.first();
  const { executor } = roleDeleteLog;

  let roleDeleteEmbed = new EmbedBuilder()
    .setTitle('**تم حذف رتبة**')
    .addFields({name:'اسم الرتبة :', value:`\`\`\`${role.name}\`\`\``, inline:true},{name:'الذي قام بحذف الرتبة :', value:`\`\`\`${executor.username} (${executor.id})\`\`\``, inline:true})
    .setTimestamp();

  await roleDeleteLog2.send({ embeds: [roleDeleteEmbed] });
})




client27.on('channelCreate', async (channel) => {
if (logsDB.has(`log_channelcreate_${channel.guild.id}`)) {
let channelCreateLog1 = logsDB.get(`log_channelcreate_${channel.guild.id}`);
let channelCreateLog2 = channel.guild.channels.cache.get(channelCreateLog1);




const fetchedLogs = await channel.guild.fetchAuditLogs({
  limit: 1,
  type: AuditLogEvent.ChannelCreate
});

const channelCreateLog = fetchedLogs.entries.first();
const { executor } = channelCreateLog;

let channelCategory = channel.parent ? channel.parent.name : 'None';

let channelCreateEmbed = new EmbedBuilder()
  .setTitle('**تم انشاء روم**')
  .addFields(
    { name: 'اسم الروم : ', value: `\`\`\`${channel.name}\`\`\``, inline: true },
    { name: 'كاتيجوري الروم : ', value: `\`\`\`${channelCategory}\`\`\``, inline: true },
    { name: 'الذي قام بانشاء الروم : ', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
  )
  .setTimestamp();

await channelCreateLog2.send({ embeds: [channelCreateEmbed] });
}
});




client27.on('channelDelete', async (channel) => {
if (logsDB.has(`log_channeldelete_${channel.guild.id}`)) {
let channelDeleteLog1 = logsDB.get(`log_channeldelete_${channel.guild.id}`);
let channelDeleteLog2 = channel.guild.channels.cache.get(channelDeleteLog1);




const fetchedLogs = await channel.guild.fetchAuditLogs({
  limit: 1,
  type: AuditLogEvent.ChannelDelete
});

const channelDeleteLog = fetchedLogs.entries.first();
const { executor } = channelDeleteLog;

let channelDeleteEmbed = new EmbedBuilder()
  .setTitle('**تم حذف روم**')
  .addFields(
    { name: 'اسم الروم : ', value: `\`\`\`${channel.name}\`\`\``, inline: true },
    { name: 'الذي قام بحذف الروم : ', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: true }
  )
  .setTimestamp();

await channelDeleteLog2.send({ embeds: [channelDeleteEmbed] });
}
});

client27.on('guildMemberUpdate', async (oldMember, newMember) => {
const guild = oldMember.guild;
const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));




if (addedRoles.size > 0 && logsDB.has(`log_rolegive_${guild.id}`)) {
let roleGiveLog1 = logsDB.get(`log_rolegive_${guild.id}`);
let roleGiveLog2 = guild.channels.cache.get(roleGiveLog1);

const fetchedLogs = await guild.fetchAuditLogs({
  limit: addedRoles.size,
  type: AuditLogEvent.MemberRoleUpdate
});

addedRoles.forEach((role) => {
  const roleGiveLog = fetchedLogs.entries.find((log) => log.target.id === newMember.id && log.changes[0].new[0].id === role.id);
  const roleGiver = roleGiveLog ? roleGiveLog.executor : null;
  const roleGiverUsername = roleGiver ? `${roleGiver.username} (${roleGiver.id})` : `UNKNOWN`;



  let roleGiveEmbed = new EmbedBuilder()
    .setTitle('**تم إعطاء رتبة لعضو**')
    .addFields(
      { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
      { name: 'تم إعطاءها بواسطة:', value: `\`\`\`${roleGiverUsername}\`\`\``, inline: true },
      { name: 'تم إعطائها للعضو:', value: `\`\`\`${newMember.user.username} (${newMember.user.id})\`\`\``, inline: true }
    )
    .setTimestamp();

  roleGiveLog2.send({ embeds: [roleGiveEmbed] });
});
}

if (removedRoles.size > 0 && logsDB.has(`log_roleremove_${guild.id}`)) {
let roleRemoveLog1 = logsDB.get(`log_roleremove_${guild.id}`);
let roleRemoveLog2 = guild.channels.cache.get(roleRemoveLog1);

const fetchedLogs = await guild.fetchAuditLogs({
  limit: removedRoles.size,
  type: AuditLogEvent.MemberRoleUpdate
});




removedRoles.forEach((role) => {
  const roleRemoveLog = fetchedLogs.entries.find((log) => log.target.id === newMember.id && log.changes[0].new[0].id === role.id);
  const roleRemover = roleRemoveLog ? roleRemoveLog.executor : null;
  const roleRemoverUsername = roleRemover ? `${roleRemover.username} (${roleRemover.id})` : `UNKNOWN`;

  let roleRemoveEmbed = new EmbedBuilder()
    .setTitle('**تم إزالة رتبة من عضو**')
    .addFields(
      { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
      { name: 'تم إزالتها بواسطة:', value: `\`\`\`${roleRemoverUsername}\`\`\``, inline: true },
      { name: 'تم إزالتها من العضو:', value: `\`\`\`${newMember.user.username} (${newMember.user.id})\`\`\``, inline: true }
    )
    .setTimestamp();


  roleRemoveLog2.send({ embeds: [roleRemoveEmbed] });
});
}
});
client27.on('guildMemberAdd', async (member) => {
const guild = member.guild;

// Token Detection System
if (!member.bot && tokenDB.get(`auto_detect_${guild.id}`)) {
  let suspicionScore = 0;
  let reasons = [];

  // Check 1: New account (less than 7 days)
  const accountAge = Date.now() - member.user.createdTimestamp;
  if (accountAge < 7 * 24 * 60 * 60 * 1000) {
    suspicionScore += 3;
    reasons.push('حساب جديد');
  }

  // Check 2: No avatar
  if (member.user.avatar === null) {
    suspicionScore += 2;
    reasons.push('بدون صورة');
  }

  // Check 3: Suspicious username (many numbers)
  const numberCount = (member.user.username.match(/\d/g) || []).length;
  if (numberCount > 5) {
    suspicionScore += 2;
    reasons.push('اسم مشبوه');
  }

  // If score >= 5, take action
  if (suspicionScore >= 5) {
    const action = tokenDB.get(`auto_action_${guild.id}`) || 'kick';
    const logChannel = tokenDB.get(`token_log_${guild.id}`);
    
    // Update stats
    const totalDetected = tokenDB.get(`total_detected_${guild.id}`) || 0;
    tokenDB.set(`total_detected_${guild.id}`, totalDetected + 1);

    // Create log embed
    const logEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚠️ تم اكتشاف توكن!')
      .addFields(
        { name: '👤 العضو', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: '📊 نقاط الشك', value: `\`${suspicionScore}\``, inline: true },
        { name: '🔍 الأسباب', value: reasons.join(', '), inline: false }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    try {
      if (action === 'kick') {
        await member.kick('كشف تلقائي - حساب وهمي مشبوه');
        logEmbed.addFields({ name: '✅ الإجراء', value: '`تم الطرد`' });
        const totalKicked = tokenDB.get(`total_kicked_${guild.id}`) || 0;
        tokenDB.set(`total_kicked_${guild.id}`, totalKicked + 1);
      } else if (action === 'ban') {
        await member.ban({ reason: 'كشف تلقائي - حساب وهمي مشبوه' });
        logEmbed.addFields({ name: '✅ الإجراء', value: '`تم الباند`' });
        const totalBanned = tokenDB.get(`total_banned_${guild.id}`) || 0;
        tokenDB.set(`total_banned_${guild.id}`, totalBanned + 1);
      } else {
        logEmbed.addFields({ name: '✅ الإجراء', value: '`إشعار فقط`' });
      }

      // Send to log channel
      if (logChannel) {
        const channel = guild.channels.cache.get(logChannel);
        if (channel) await channel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error('Token detection error:', error);
    }
  }
}

// Bot Add Log
if(!member.bot) return;
const fetchedLogs = await guild.fetchAuditLogs({
limit: 1,
type: AuditLogEvent.BotAdd
});




const botAddLog = fetchedLogs.entries.first();
const { executor, target } = botAddLog;

if (target.bot) {
let botAddLog1 = logsDB.get(`log_botadd_${guild.id}`);
let botAddLog2 = guild.channels.cache.get(botAddLog1);

let botAddEmbed = new EmbedBuilder()
  .setTitle('**تم اضافة بوت جديد الى السيرفر**')
  .addFields(
    { name: 'اسم البوت :', value: `\`\`\`${member.user.username}\`\`\``, inline: true },
    { name: 'ايدي البوت :', value: `\`\`\`${member.user.id}\`\`\``, inline: true },
    { name: 'هل لدية صلاحية الادمن ستريتور ؟ :', value: member.permissions.has('Administrator') ? `\`\`\`نعم لديه\`\`\`` : `\`\`\`لا ليس لديه\`\`\``, inline: true },
    { name: 'تم اضافته بواسطة :', value: `\`\`\`${executor.username} (${executor.id})\`\`\``, inline: false }
  )
  .setTimestamp();

botAddLog2.send({ embeds: [botAddEmbed] });
}
});





client27.on('guildBanAdd', async (guild, user) => {
if (logsDB.has(`log_banadd_${guild.id}`)) {
let banAddLog1 = logsDB.get(`log_banadd_${guild.id}`);
let banAddLog2 = guild.channels.cache.get(banAddLog1);

const fetchedLogs = await guild.fetchAuditLogs({
  limit: 1,
  type: AuditLogEvent.MemberBanAdd
});

const banAddLog = fetchedLogs.entries.first();
const banner = banAddLog ? banAddLog.executor : null;
const bannerUsername = banner ? `\`\`\`${banner.username} (${banner.id})\`\`\`` : `\`\`\`UNKNOWN\`\`\``;


let banAddEmbed = new EmbedBuilder()
  .setTitle('**تم حظر عضو**')
  .addFields(
    { name: 'العضو المحظور:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
    { name: 'تم حظره بواسطة:', value: bannerUsername },
  )
  .setTimestamp();

banAddLog2.send({ embeds: [banAddEmbed] });
}
});




client27.on('guildBanRemove', async (guild, user) => {
if (logsDB.has(`log_bandelete_${guild.id}`)) {
let banRemoveLog1 = logsDB.get(`log_bandelete_${guild.id}`);
let banRemoveLog2 = guild.channels.cache.get(banRemoveLog1);

const fetchedLogs = await guild.fetchAuditLogs({
  limit: 1,
  type: AuditLogEvent.MemberBanRemove
});

const banRemoveLog = fetchedLogs.entries.first();
const unbanner = banRemoveLog ? banRemoveLog.executor : null;
const unbannerUsername = unbanner ? `\`\`\`${unbanner.username} (${unbanner.id})\`\`\`` : `\`\`\`UNKNOWN\`\`\``;

let banRemoveEmbed = new EmbedBuilder()
  .setTitle('**تم إزالة حظر عضو**')
  .addFields(
    { name: 'العضو المفكّر الحظر عنه:', value: `\`\`\`${user.tag} (${user.id})\`\`\`` },
    { name: 'تم إزالة الحظر بواسطة:', value: unbannerUsername }
  )
  .setTimestamp();


banRemoveLog2.send({ embeds: [banRemoveEmbed] });
}
});


client27.on('guildMemberRemove', async (member) => {
const guild = member.guild;
if (logsDB.has(`log_kickadd_${guild.id}`)) {
const kickLogChannelId = logsDB.get(`log_kickadd_${guild.id}`);
const kickLogChannel = guild.channels.cache.get(kickLogChannelId);

const fetchedLogs = await guild.fetchAuditLogs({
  limit: 1,
  type: AuditLogEvent.MemberKick,
});

const kickLog = fetchedLogs.entries.first();
const kicker = kickLog ? kickLog.executor : null;
const kickerUsername = kicker ? `\`\`\`${kicker.username} (${kicker.id})\`\`\`` : 'Unknown';

const kickEmbed = new EmbedBuilder()
  .setTitle('**تم طرد عضو**')
  .addFields(
    { name: 'العضو المطرود:', value: `\`\`\`${member.user.tag} (${member.user.id})\`\`\`` },
    { name: 'تم طرده بواسطة:', value: kickerUsername },
  )
  .setTimestamp();

kickLogChannel.send({ embeds: [kickEmbed] });
}
});

let invites = {}; 
const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

client27.on('inviteCreate', async invite => {
    if (!invites[invite.guild.id]) {
        invites[invite.guild.id] = new Map();
    }
    invites[invite.guild.id].set(invite.code, invite.uses);
});

client27.on('inviteDelete', async invite => {
    if (invites[invite.guild.id]) {
        invites[invite.guild.id].delete(invite.code);
    }
});




client27.on("guildMemberAdd" , async(member) => {
  const theeGuild = member.guild
  let rooms = nadekoDB.get(`rooms_${theeGuild.id}`)
  const message = nadekoDB.get(`message_${theeGuild.id}`)
  if(!rooms) return;
  if(rooms.length <= 0) return;
  if(!message) return;
  await rooms.forEach(async(room) => {
    const theRoom = await theeGuild.channels.cache.find(ch => ch.id == room)
    if(!theRoom) return;
    await theRoom.send({content:`${member} - ${message}`}).then(async(msg) => {
      setTimeout(() => {
        msg.delete();
      }, 3000);
    })
  })
})

  client27.on("messageCreate" ,  async(message) => {
    if(message.author.bot) return;
    const autoReplys = one4allDB.get(`replys_${message.guild.id}`);
    if(!autoReplys) return;
    const data = autoReplys.find((r) => r.word == message.content);
    if(!data) return;
    message.reply(`${data.reply}`)
  })



  client27.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('help_')) return;

    try { await interaction.deferUpdate(); } catch { return; }
    const { prefix } = require('./config');

    // ===== الأزرار المشتركة =====
    function getNavRows(active) {
      const btn = (id, label, emoji) => {
        const b = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(ButtonStyle.Secondary).setEmoji(emoji);
        if (id === active) b.setDisabled(true).setStyle(ButtonStyle.Primary);
        return b;
      };
      // الصف 1: الأساسيات
      const row1 = new ActionRowBuilder().addComponents(
        btn('help_general',    '🌐 عام',         '🌐'),
        btn('help_system',     '⚙️ سيستم',       '⚙️'),
        btn('help_prefix',     '⚡ بريفكس',       '⚡'),
        btn('help_protection', '🛡️ حماية',       '🛡️'),
        btn('help_ticket',     '🎫 تكت',          '🎫'),
      );
      // الصف 2: الأنظمة
      const row2 = new ActionRowBuilder().addComponents(
        btn('help_logs',       '📜 لوج',          '📜'),
        btn('help_apply',      '📝 تقديمات',     '📝'),
        btn('help_autoreply',  '💬 رد تلقائي',   '💬'),
        btn('help_autorole',   '🎭 رتب تلقائية', '🎭'),
        btn('help_broadcast',  '📢 برودكاست',    '📢'),
      );
      // الصف 3: المميزات
      const row3 = new ActionRowBuilder().addComponents(
        btn('help_azkar',      '📿 أذكار',        '📿'),
        btn('help_tax',        '💰 ضريبة',        '💰'),
        btn('help_levels',     '⭐ مستويات',      '⭐'),
        btn('help_suggestion', '💡 اقتراحات',     '💡'),
        btn('help_feedback',   '💭 آراء',          '💭'),
      );
      // الصف 4: المتقدم + معلومات
      const row4 = new ActionRowBuilder().addComponents(
        btn('help_ai',         '🤖 AI',             '🤖'),
        btn('help_autoline',   '↔️ خط تلقائي',   '↔️'),
        btn('help_tokens',     '🔍 توكنات',        '🔍'),
        btn('help_owners',     '👑 الأونرز',       '👑'),
        btn('help_developers', '👨‍💻 المطورون',    '👨‍💻'),
      );
      return [row1, row2, row3, row4];
    }

    function baseEmbed(title, color = 'DarkButNotBlack') {
      return new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setFooter({ text: `Requested by ${interaction.user.username} • Made by king, STEVEN & ZAK`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
    }

    // ===== عام =====
    if (interaction.customId === 'help_general') {
      const embed = baseEmbed('🌐 الأوامر العامة')
        .addFields(
          { name: '`/ping`', value: 'سرعة البوت', inline: true },
          { name: '`/help`', value: 'قائمة الأوامر', inline: true },
          { name: '`/dashboard`', value: 'لوحة التحكم', inline: true },
          { name: '`/developers`', value: 'معلومات المطورين', inline: true },
          { name: '`/owners`', value: 'أصحاب البوت', inline: true },
          { name: '`/decorate`', value: 'زخرفة النصوص', inline: true },
          { name: '`/avatar`', value: 'صورة مستخدم', inline: true },
          { name: '`/banner`', value: 'بانر مستخدم', inline: true },
          { name: '`/user`', value: 'معلومات مستخدم', inline: true },
          { name: '`/server`', value: 'معلومات السيرفر', inline: true },
          { name: '`/shortcut`', value: '⚡ إضافة اختصار لأمر بريفكس', inline: true },
          { name: '`/leaderboard`', value: '🏆 لوحة ترتيب المستويات', inline: true },
          { name: '`/rank`', value: '📊 رتبتك في المستويات', inline: true },
          { name: '`/setlevel`', value: '⚙️ تعيين مستوى عضو (أدمن)', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_general') });
    }

    // ===== سيستم =====
    if (interaction.customId === 'help_system') {
      const embed = baseEmbed('⚙️ أوامر السيستم')
        .addFields(
          { name: '`/clear`', value: 'حذف رسائل', inline: true },
          { name: '`/ban`', value: 'باند مستخدم', inline: true },
          { name: '`/kick`', value: 'كيك مستخدم', inline: true },
          { name: '`/mute`', value: 'كتم مستخدم', inline: true },
          { name: '`/timeout`', value: 'تايم اوت', inline: true },
          { name: '`/role`', value: 'إضافة/إزالة رتبة', inline: true },
          { name: '`/roles`', value: 'عرض رتب عضو', inline: true },
          { name: '`/nickname`', value: 'تغيير نيكنيم', inline: true },
          { name: '`/lock`', value: 'قفل روم', inline: true },
          { name: '`/unlock`', value: 'فتح روم', inline: true },
          { name: '`/hide`', value: 'إخفاء روم', inline: true },
          { name: '`/unhide`', value: 'إظهار روم', inline: true },
          { name: '`/say`', value: 'إرسال رسالة', inline: true },
          { name: '`/send`', value: 'إرسال embed', inline: true },
          { name: '`/embed`', value: 'بناء embed', inline: true },
          { name: '`/come`', value: 'استدعاء مستخدم', inline: true },
          { name: '`/setup-welcome`', value: 'إعداد رسالة الترحيب', inline: true },

          { name: '`/setup-decoration`', value: 'إعداد زخرفة البوت', inline: true },
          { name: '`/add-info-button`', value: 'إضافة زر معلومات', inline: true },
          { name: '`/ai-info`', value: '🤖 معلومات الذكاء الاصطناعي', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_system') });
    }

    // ===== حماية =====
    if (interaction.customId === 'help_protection') {
      const embed = baseEmbed('🛡️ أوامر الحماية', '#FF0000')
        .setDescription('🔒 **أوامر الحماية لصاحب البوت وصاحب السيرفر فقط!**\n⚠️ ارفع رتبة البوت لأعلى رتبة في السيرفر للحماية الكاملة!')
        .addFields(
          { name: '`/setup-protection`', value: '⭐ تفعيل/تعطيل كل الحماية دفعة واحدة', inline: false },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**🛡️ الوايت ليست (صاحب البوت/السيرفر)**', inline: false },
          { name: '`/whitelist add-user [ID] [type]`', value: '✅ إضافة عضو أو بوت بالـ ID', inline: false },
          { name: '`/whitelist add-role [@رتبة] [type]`', value: '✅ إضافة رتبة كاملة — كل أعضاءها يتحمون تلقائياً', inline: false },
          { name: '`/whitelist remove-user [ID] [type]`', value: '❌ إزالة عضو أو بوت', inline: true },
          { name: '`/whitelist remove-role [@رتبة] [type]`', value: '❌ إزالة رتبة', inline: true },
          { name: '`/whitelist list`', value: '📋 عرض الأعضاء والرتب المحميين', inline: true },
          { name: '`/whitelist clear`', value: '🗑️ مسح الكل', inline: true },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**🔑 أنواع الوايت ليست**', inline: false },
          { name: '`all`', value: '🛡️ محمي من كل الحماية', inline: true },
          { name: '`ban`', value: '🔨 باند جماعي', inline: true },
          { name: '`kick`', value: '👢 كيك جماعي', inline: true },
          { name: '`channel`', value: '📁 رومات (إنشاء/حذف/تعديل)', inline: true },
          { name: '`role`', value: '🎭 رتب (إنشاء/حذف/تعديل)', inline: true },
          { name: '`server`', value: '⚙️ تعديل السيرفر', inline: true },
          { name: '`webhook`', value: '🔗 ويب هوك', inline: true },
          { name: '`bots`', value: '🤖 إضافة بوتات', inline: true },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**⚙️ أوامر الحماية الفردية**', inline: false },
          { name: '`/anti-ban`', value: 'باند جماعي', inline: true },
          { name: '`/anti-kick`', value: 'كيك جماعي', inline: true },
          { name: '`/anti-delete-rooms`', value: 'حذف رومات', inline: true },
          { name: '`/anti-delete-roles`', value: 'حذف رتب', inline: true },
          { name: '`/anti-role-create`', value: 'إنشاء رتب', inline: true },
          { name: '`/anti-role-edit`', value: 'تعديل رتب', inline: true },
          { name: '`/anti-channel-create`', value: 'إنشاء رومات', inline: true },
          { name: '`/anti-channel-edit`', value: 'تعديل رومات', inline: true },
          { name: '`/anti-server-edit`', value: 'تعديل السيرفر', inline: true },
          { name: '`/anti-webhook`', value: 'ويب هوك', inline: true },
          { name: '`/anti-bots`', value: 'إضافة بوتات', inline: true },
          { name: '`/set-logs`', value: 'روم سجل الحماية', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_protection') });
    }


    // ===== تكت =====
    if (interaction.customId === 'help_ticket') {
      const embed = baseEmbed('🎫 نظام التكت')
        .addFields(
          { name: '`/setup-ticket`', value: 'إعداد نظام التكت الرئيسي', inline: true },
          { name: '`/add-ticket-button`', value: 'إضافة زر تكت إضافي', inline: true },
          { name: '`/to-select`', value: 'تحويل الأزرار لقائمة', inline: true },
          { name: '`/set-ticket-log`', value: 'تحديد روم سجل التكت', inline: true },
          { name: '`/add-user`', value: 'إضافة مستخدم للتكت', inline: true },
          { name: '`/remove-user`', value: 'إزالة مستخدم من التكت', inline: true },
          { name: '`/close`', value: 'إغلاق تكت', inline: true },
          { name: '`/delete`', value: 'حذف تكت', inline: true },
          { name: '`/rename`', value: 'تغيير اسم التكت', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_ticket') });
    }

    // ===== لوج =====
    if (interaction.customId === 'help_logs') {
      const embed = baseEmbed('📜 نظام اللوج')
        .addFields(
          { name: '`/setup-logs`', value: 'إعداد نظام اللوج وتحديد الروم', inline: true },
          { name: '`/logs-info`', value: 'عرض معلومات إعداد اللوج الحالي', inline: true },
          { name: '`/set-protect-logs`', value: 'تحديد روم سجل الحماية', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_logs') });
    }

    // ===== تقديمات =====
    if (interaction.customId === 'help_apply') {
      const embed = baseEmbed('📝 نظام التقديمات')
        .addFields(
          { name: '`/new-apply`', value: 'إنشاء نظام تقديم جديد', inline: true },
          { name: '`/setup-apply`', value: 'إعداد نظام التقديم', inline: true },
          { name: '`/close-apply`', value: 'إغلاق التقديم', inline: true },
          { name: '`/dm-mode`', value: 'إعداد وضع الرسائل الخاصة', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_apply') });
    }

    // ===== رد تلقائي =====
    if (interaction.customId === 'help_autoreply') {
      const embed = baseEmbed('💬 نظام الرد التلقائي')
        .addFields(
          { name: '`/autoreply-add`', value: 'إضافة رد تلقائي لكلمة معينة', inline: true },
          { name: '`/autoreply-remove`', value: 'حذف رد تلقائي', inline: true },
          { name: '`/autoreply-list`', value: 'عرض كل الردود التلقائية', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_autoreply') });
    }

    // ===== رتب تلقائية =====
    if (interaction.customId === 'help_autorole') {
      const embed = baseEmbed('🎭 نظام الرتب التلقائية')
        .addFields(
          { name: '`/new-panel`', value: 'إنشاء لوحة رتب جديدة بالأزرار', inline: true },
          { name: '`/add-button`', value: 'إضافة زر رتبة للوحة', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_autorole') });
    }

    // ===== برودكاست =====
    if (interaction.customId === 'help_broadcast') {
      const embed = baseEmbed('📢 نظام البرودكاست')
        .addFields(
          { name: '`/send-panel`', value: 'إرسال رسالة جماعية لكل السيرفرات', inline: true },
          { name: '`/remove-token`', value: 'إزالة توكن من البرودكاست', inline: true },
          { name: '`/remove-all-tokens`', value: 'إزالة كل التوكنات', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_broadcast') });
    }

    // ===== أذكار =====
    // ===== المستويات =====
    if (interaction.customId === 'help_levels') {
      const embed = baseEmbed('⭐ نظام المستويات', '#FFD700')
        .setDescription('> كلما أرسل العضو رسائل، كلما ارتقى مستواه! 🚀\n> رسالة واحدة كل دقيقة تُحسب (لمنع السبام)')
        .addFields(
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**📌 أوامر الإعداد (أدمن)**', inline: false },
          { name: '`/setup-level enable`', value: '✅ تفعيل النظام + تحديد روم الإشعارات', inline: false },
          { name: '`/setup-level disable`', value: '❌ تعطيل نظام المستويات', inline: false },
          { name: '`/setup-level info`', value: '📊 عرض الإعدادات الحالية', inline: false },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**📌 أوامر الأعضاء**', inline: false },
          { name: '`/rank`', value: '📊 عرض مستواك أو مستوى عضو آخر', inline: true },
          { name: '`/leaderboard`', value: '🏆 أعلى 10 أعضاء مستوىً', inline: true },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**⚙️ كيف يشتغل النظام؟**', inline: false },
          { name: '💬 عدد الرسائل', value: 'أساس الترقي — كلما أرسلت أكثر كلما ارتقيت', inline: true },
          { name: '⏱️ الكولداون', value: 'رسالة كل دقيقة فقط تُحسب', inline: true },
          { name: '🎉 إشعار الترقي', value: 'البوت يرسل embed في روم المستويات عند الترقي', inline: false },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_levels') });
    }

    if (interaction.customId === 'help_azkar') {
      const embed = baseEmbed('📿 نظام الأذكار', '#2ECC71')
        .addFields(
          { name: '`/azkar`', value: 'إرسال ذكر عشوائي', inline: true },
          { name: '`/set-azkar-channel`', value: 'تحديد روم الأذكار التلقائية', inline: true },
          { name: '`/azkar-mode`', value: 'تفعيل/تعطيل الأذكار التلقائية', inline: true },
          { name: '`/azkar-time`', value: 'تحديد وقت الإرسال التلقائي', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_azkar') });
    }

    // ===== ضريبة =====
    if (interaction.customId === 'help_tax') {
      const embed = baseEmbed('💰 نظام الضريبة')
        .addFields(
          { name: '`/tax`', value: 'حساب ضريبة أي مبلغ', inline: true },
          { name: '`/set-tax-room`', value: 'تحديد روم الضريبة التلقائية', inline: true },
          { name: '`/set-tax-line`', value: 'تحديد الخط', inline: true },
          { name: '`/tax-mode`', value: 'تحديد شكل الضريبة', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_tax') });
    }

    // ===== خط تلقائي =====
    if (interaction.customId === 'help_autoline') {
      const embed = baseEmbed('🤖 نظام الخط التلقائي')
        .addFields(
          { name: '`/add-autoline-channel`', value: 'إضافة روم للخط التلقائي', inline: true },
          { name: '`/remove-autoline-channel`', value: 'إزالة روم من الخط التلقائي', inline: true },
          { name: '`/set-line`', value: 'تحديد نص الخط', inline: true },
          { name: '`/line-mode`', value: 'تفعيل/تعطيل الخط التلقائي', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_autoline') });
    }

    // ===== اقتراحات =====
    if (interaction.customId === 'help_suggestion') {
      const embed = baseEmbed('💡 نظام الاقتراحات')
        .addFields(
          { name: '`/set-suggestions-room`', value: 'تحديد روم الاقتراحات', inline: true },
          { name: '`/suggestion-mode`', value: 'تفعيل/تعطيل الاقتراحات', inline: true },
          { name: '`/set-line` (اقتراحات)', value: 'تحديد خط الاقتراحات', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_suggestion') });
    }

    // ===== آراء =====
    if (interaction.customId === 'help_feedback') {
      const embed = baseEmbed('💭 نظام الآراء')
        .addFields(
          { name: '`/set-feedback-room`', value: 'تحديد روم الآراء', inline: true },
          { name: '`/feedback-mode`', value: 'تفعيل/تعطيل نظام الآراء', inline: true },
          { name: '`/setup-rating`', value: 'إعداد نظام التقييم', inline: true },
          { name: '`/set-line` (آراء)', value: 'تحديد خط الآراء', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_feedback') });
    }

    // ===== ذكاء اصطناعي =====
    if (interaction.customId === 'help_ai') {
      const embed = baseEmbed('🤖 نظام الذكاء الاصطناعي', '#5865F2')
        .setDescription(
          '> يرد البوت على **أي سؤال** في الروم المحدد باستخدام **Groq AI** مجاناً!\n' +
          '> 🔑 الـ API Key **تلقائي** — الأدمن يختار الروم فقط بدون أي إعداد إضافي!'
        )
        .addFields(
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**📌 الأوامر المتاحة**', inline: false },
          { name: '`/setup-ai set`', value: '✅ **تفعيل الذكاء الاصطناعي**\nاختار الروم فقط — الـ API Key يشتغل تلقائياً 🎉', inline: false },
          { name: '`/setup-ai disable`', value: '❌ **تعطيل الذكاء الاصطناعي**\nإيقاف الردود في السيرفر', inline: false },
          { name: '`/setup-ai info`', value: '📊 **عرض الإعدادات الحالية**\nيظهر الروم والموديل والحالة وتاريخ الإعداد', inline: false },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**🚀 طريقة التشغيل (خطوة واحدة فقط!)**', inline: false },
          { name: '✅ كل اللي عليك تعمله', value: '> اكتب `/setup-ai set`\n> اختار الروم اللي تريد البوت يرد فيه\n> اختار الموديل (أو اتركه افتراضي)\n> **خلاص! البوت يشتغل فوراً 🤖**', inline: false },
          { name: '━━━━━━━━━━━━━━━━━━━━━', value: '**🧠 الموديلات المتاحة**', inline: false },
          { name: '`llama-3.1-8b-instant`', value: '⚡ الافتراضي — أسرع استجابة', inline: true },
          { name: '`llama-3.3-70b-versatile`', value: '🧠 أذكى — إجابات أدق', inline: true },
          { name: '`gemma2-9b-it`', value: '🔹 خيار بديل من Google', inline: true },
          { name: '⚠️ ملاحظات', value: '• الأوامر للأدمن فقط (رتبته أعلى من البوت)\n• كل سيرفر عنده إعداداته المنفصلة\n• البوت يتجاهل الأوامر اللي تبدأ بـ `/` أو `!` في روم الـ AI', inline: false },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_ai') });
    }
    // ===== ناديكو =====
    if (interaction.customId === 'help_nadeko') {
      const embed = baseEmbed('⏳ نظام ناديكو')
        .addFields(
          { name: '`/add-nadeko-room`', value: 'إضافة روم ناديكو', inline: true },
          { name: '`/remove-nadeko-room`', value: 'إزالة روم ناديكو', inline: true },
          { name: '`/set-message`', value: 'تحديد رسالة ناديكو', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_nadeko') });
    }

    // ===== ايموجي تلقائي =====
    if (interaction.customId === 'help_autoemoji') {
      const embed = baseEmbed('🎭 نظام الإيموجي التلقائي')
        .addFields(
          { name: '`/set-emoji-room`', value: 'تحديد روم لحفظ الإيموجيات', inline: true },
          { name: '`/remove-emoji-room`', value: 'إيقاف نظام حفظ الإيموجيات', inline: true },
          { name: '`/emoji-list`', value: 'عرض الإيموجيات المحفوظة', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_autoemoji') });
    }

    // ===== توكنات =====
    if (interaction.customId === 'help_tokens') {
      const embed = baseEmbed('🔍 نظام كشف التوكنات Premium', '#FF6B00')
        .setDescription('🔒 **هذه الخدمة للأعضاء المميزين فقط!** - تواصل مع الأونر للحصول على الصلاحية.')
        .addFields(
          { name: '`/scan-tokens`', value: 'كشف الأعضاء الوهمية في السيرفر', inline: true },
          { name: '`/kick-tokens`', value: 'طرد الأعضاء الوهمية تلقائياً', inline: true },
          { name: '`/token-premium add`', value: '(أونر) منح صلاحية مع تحديد مدة', inline: true },
          { name: '`/token-premium remove`', value: '(أونر) إزالة صلاحية', inline: true },
          { name: '`/token-premium list`', value: '(أونر) عرض قائمة الأعضاء', inline: true },
          { name: '`/token-premium check`', value: '(أونر) فحص صلاحية عضو', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_tokens') });
    }

    // ===== بريفكس =====
    if (interaction.customId === 'help_prefix') {
      const embed = baseEmbed('⚡ أوامر البريفكس', '#F39C12')
        .setDescription(`البريفكس الافتراضي: **\`${prefix}\`** (يمكن تغييره لكل سيرفر)`)
        .addFields(
          { name: `\`${prefix}م <عدد>\``, value: 'حذف رسائل (1-100)', inline: true },
          { name: `\`${prefix}كيك <@مستخدم>\``, value: 'كيك مستخدم', inline: true },
          { name: `\`${prefix}باند <@مستخدم>\``, value: 'باند مستخدم', inline: true },
          { name: `\`${prefix}قفل\``, value: 'قفل الروم', inline: true },
          { name: `\`${prefix}فتح\``, value: 'فتح الروم', inline: true },
          { name: `\`${prefix}اخفاء\``, value: 'إخفاء الروم', inline: true },
          { name: `\`${prefix}اظهار\``, value: 'إظهار الروم', inline: true },
          { name: `\`${prefix}بينج\``, value: 'سرعة البوت', inline: true },
          { name: `\`${prefix}سيرفر\``, value: 'معلومات السيرفر', inline: true },
          { name: `\`${prefix}يوزر <@مستخدم>\``, value: 'معلومات مستخدم', inline: true },
          { name: `\`${prefix}حماية-تفعيل\``, value: 'تفعيل كل الحماية', inline: true },
          { name: `\`${prefix}حماية-تعطيل\``, value: 'تعطيل كل الحماية', inline: true },
          { name: `\`${prefix}حماية-حالة\``, value: 'حالة الحماية', inline: true },
          { name: `\`${prefix}بريفكس <جديد>\``, value: 'تغيير البريفكس', inline: true },
          { name: `\`${prefix}مساعدة\``, value: 'قائمة أوامر البريفكس', inline: true },
          { name: `\`${prefix}rename [اسم]\``, value: 'تغيير اسم الروم الحالي', inline: true },
          { name: `\`${prefix}ticket-close\``, value: 'إغلاق التكت', inline: true },
          { name: `\`${prefix}ticket-add @عضو\``, value: 'إضافة عضو للتكت', inline: true },
          { name: `\`${prefix}ticket-remove @عضو\``, value: 'إزالة عضو من التكت', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_prefix') });
    }

    // ===== الأونرز =====
    if (interaction.customId === 'help_owners') {
      const { owners: ownersList } = require('./config');
      const ownerFields = [];
      for (let i = 0; i < ownersList.length; i++) {
        const ownerId = ownersList[i];
        let ownerName = `Owner ${i + 1}`;
        try {
          const u = await interaction.client.users.fetch(ownerId);
          ownerName = u.username;
        } catch {}
        if (ownerId !== 'OWNER_2_ID_HERE') {
          ownerFields.push({ name: `👑 أونر ${i + 1}`, value: `<@${ownerId}>\n\`${ownerId}\``, inline: true });
        }
      }
      if (ownerFields.length === 0) {
        ownerFields.push({ name: '⚠️ ملاحظة', value: 'لم يتم تحديد الأونرز بعد في config.js', inline: false });
      }
      const embed = baseEmbed('👑 أصحاب البوت', '#FFD700')
        .setDescription('**هؤلاء هم أصحاب البوت ومسؤولون عن تطويره وإدارته**')
        .addFields(...ownerFields)
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }));
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_owners') });
    }

    // ===== المطورون =====
    if (interaction.customId === 'help_developers') {
      const { developers } = require('./config');
      let stevenUser = null, zakUser = null, kingUser = null;
      try { kingUser = await interaction.client.users.fetch(developers.king.id); } catch {}
      try { stevenUser = await interaction.client.users.fetch(developers.steven.id); } catch {}
      try { zakUser = await interaction.client.users.fetch(developers.zak.id); } catch {}

      const embed = baseEmbed('👨‍💻 مطورو البوت', '#5865F2')
        .setDescription('**الفريق التقني الذي بنى هذا البوت 💙**')
        .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: '👑 Lead Developer',
            value: kingUser
              ? \`<@\${developers.king.id}>\n**\${developers.king.name}**\n\\`\${developers.king.id}\\`\`
              : \`**\${developers.king.name}**\n*(لم يتم تحديد الـ ID)*\`,
            inline: true
          },
          {
            name: '⚡ Co-Developer',
            value: stevenUser
              ? \`<@\${developers.steven.id}>\n**\${developers.steven.name}**\n\\`\${developers.steven.id}\\`\`
              : \`**\${developers.steven.name}**\`,
            inline: true
          },
          {
            name: '🔧 Developer',
            value: zakUser
              ? \`<@\${developers.zak.id}>\n**\${developers.zak.name}**\n\\`\${developers.zak.id}\\`\`
              : \`**\${developers.zak.name}**\`,
            inline: true
          },
          { name: '\u200B', value: '\u200B', inline: false },
          {
            name: '📊 إحصائيات البوت',
            value: [
              \`🌐 **السيرفرات:** \\`\${interaction.client.guilds.cache.size}\\`\`,
              \`👥 **المستخدمون:** \\`\${interaction.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()}\\`\`,
              \`📡 **البينج:** \\`\${interaction.client.ws.ping}ms\\`\`,
            ].join('\n'),
            inline: false
          },
          { name: '🌐 سيرفر الدعم', value: '[اضغط هنا](https://discord.gg/HC8V8cPF4)', inline: true },
        );
      return interaction.editReply({ embeds: [embed], components: getNavRows('help_developers') });
    }

  })

  //-------------------------- جميع الاكواد هنا ----------------------////-------------------------- جميع الاكواد هنا ----------------------//

// ====================================================
// ========= نظام حماية السيرفر الاحترافي ============
// ====================================================

// ===== حماية اسم وصورة السيرفر =====

// نظام الحماية - قراءة مباشرة من JSON بدون كاش
const protectConfig = require('./protect-config');

// ===== وايت ليست الحماية =====
// type: 'ban' | 'kick' | 'channel' | 'role' | 'server' | 'webhook' | 'bots' | 'all'
// userRoleIds: مصفوفة IDs رتب العضو (اختياري)
function isWhitelisted(guildId, userId, clientId, type, userRoleIds) {
  if (userId === clientId) return true; // البوت نفسه محمي دائماً

  // ✅ يقرأ من protectConfig (protect-config.js) - نفس المكان اللي يحفظ فيه whitelist.js
  const wl = protectConfig.get(`whitelist_v2_${guildId}`) || {};
  const userTypes = wl[userId];
  if (userTypes && userTypes.length > 0) {
    if (userTypes.includes('all')) return true;
    if (type && userTypes.includes(type)) return true;
  }

  // فحص الرتب
  if (userRoleIds && userRoleIds.length > 0) {
    const rwl = protectConfig.get(`whitelist_roles_${guildId}`) || {};
    for (const roleId of userRoleIds) {
      const roleTypes = rwl[roleId];
      if (!roleTypes || roleTypes.length === 0) continue;
      if (roleTypes.includes('all')) return true;
      if (type && roleTypes.includes(type)) return true;
    }
  }

  return false;
}

// جلب member كامل مع فحص رتبة البوت
async function getMemberAndCheck(guild, userId) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return { roles: [], higherThanBot: false };
    const botMember = guild.members.cache.get(guild.client.user.id);
    const botHighest = botMember ? botMember.roles.highest.position : 0;
    const userHighest = member.roles.highest.position;
    return {
      roles: [...member.roles.cache.keys()],
      higherThanBot: userHighest >= botHighest  // رتبته أعلى أو مساوية للبوت
    };
  } catch { return { roles: [], higherThanBot: false }; }
}

// جلب رتب عضو من guild لتمريرها لـ isWhitelisted
async function getMemberRoles(guild, userId) {
  const result = await getMemberAndCheck(guild, userId);
  return result.roles;
}

// فحص: هل رتبة العضو أعلى من البوت؟ (لو آه، الحماية ما تشتغلش عليه)
async function isAboveBot(guild, userId) {
  if (userId === guild.ownerId) return true; // صاحب السيرفر دايماً فوق
  const result = await getMemberAndCheck(guild, userId);
  return result.higherThanBot;
}

function getProtect(key) { return protectConfig.get(key); }

client27.on('guildUpdate', async (oldGuild, newGuild) => {
  try {
    const enabled = getProtect(`anti_server_edit_${newGuild.id}`);
    console.log(`[PROTECT] guildUpdate | enabled: ${enabled} | guild: ${newGuild.id}`);
    if (!enabled) return;

    const savedName = getProtect(`server_name_${newGuild.id}`);
    const savedIcon = getProtect(`server_icon_${newGuild.id}`);

    const nameChanged = oldGuild.name !== newGuild.name;
    const iconChanged = oldGuild.icon !== newGuild.icon;
    if (!nameChanged && !iconChanged) return;

    // Get who made the change from audit logs
    await new Promise(r => setTimeout(r, 1500));
    const fetchedLogs = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate, limit: 1 });
    const log = fetchedLogs.entries.first();
    const executor = log ? log.executor : null;
    console.log(`[PROTECT] Executor: ${executor ? executor.username + ' (' + executor.id + ')' : 'NULL'}`);

    // Restore server name
    if (nameChanged && savedName) {
      await newGuild.setName(savedName).catch(() => {});
    }

    // Restore server icon
    if (iconChanged && savedIcon) {
      await newGuild.setIcon(savedIcon).catch(() => {});
    }

    // Ban everyone except the bot itself and the server owner
    if (executor && executor.id !== newGuild.client.user.id && executor.id !== newGuild.ownerId && !isWhitelisted(newGuild.id, executor.id, newGuild.client.user.id, 'server', await getMemberRoles(newGuild, executor.id)) && !await isAboveBot(newGuild, executor.id)) {
      const member = await newGuild.members.fetch(executor.id).catch(() => null);
      if (member) {
        const botMember = newGuild.members.cache.get(newGuild.client.user.id);
        const botHighestRole = botMember ? botMember.roles.highest.position : 0;
        const memberHighestRole = member.roles.highest.position;
        console.log(`[PROTECT] Bot role: ${botHighestRole} | Member role: ${memberHighestRole}`);

        if (botHighestRole > memberHighestRole) {
          const rolesToRemove = member.roles.cache.filter(r => r.id !== newGuild.roles.everyone.id);
          await member.roles.remove(rolesToRemove, '🛡️ نظام الحماية').catch(() => {});
        } else {
          console.log(`[PROTECT] WARNING: Bot role not high enough to remove member roles`);
        }

        await newGuild.bans.create(executor.id, { deleteMessageSeconds: 0, reason: '🛡️ نظام الحماية: تغيير معلومات السيرفر' })
          .then(() => console.log(`[PROTECT] BAN SUCCESS: ${executor.id}`))
          .catch(e => console.error('[PROTECT] BAN FAILED:', e.message, e.code));

        // Send notification to system log channel if exists
        const logChannelId = getProtect(`set_protect_logs_${newGuild.id}`);
        if (logChannelId) {
          const logChannel = newGuild.channels.cache.get(logChannelId);
          if (logChannel) {
            const botMemberCheck = newGuild.members.cache.get(newGuild.client.user.id);
            const canBan = botMemberCheck && botMemberCheck.roles.highest.position > member.roles.highest.position;
            const embed = new EmbedBuilder()
              .setColor(canBan ? '#FF0000' : '#FF8800')
              .setTitle('🛡️ نظام الحماية - تغيير السيرفر')
              .addFields(
                { name: '👤 المخالف', value: `<@${executor.id}> (\`${executor.id}\`)`, inline: true },
                { name: '🔨 العقوبة', value: canBan ? '`باند فوري ✅`' : '`فشل البان ❌ رتبة البوت أقل!`', inline: true },
                { name: '📝 المخالفة', value: nameChanged && iconChanged ? 'تغيير الاسم والصورة' : nameChanged ? 'تغيير اسم السيرفر' : 'تغيير صورة السيرفر', inline: false },
                { name: '🔄 الحالة', value: 'تمت محاولة استعادة الاسم والصورة', inline: false }
              )
              .setTimestamp()
              .setFooter({ text: 'Made by STEVEN' });
            if (!canBan) embed.addFields({ name: '⚠️ تحذير', value: 'ارفع رتبة البوت لأعلى موضع في السيرفر حتى تعمل الحماية!', inline: false });
            logChannel.send({ embeds: [embed] }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error('Protection guildUpdate error:', err);
  }
});

// ===== حماية حذف الرومات =====
client27.on('channelDelete', async (channel) => {
  try {
    if (!channel.guild) return;
    const enabled = getProtect(`anti_channel_edit_${channel.guild.id}`);
    if (!enabled) return;

    const snapshot = getProtect(`channels_snapshot_${channel.guild.id}`);
    if (!snapshot || !snapshot[channel.id]) return;

    const savedChannel = snapshot[channel.id];

    await new Promise(r => setTimeout(r, 1000));
    const fetchedLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
    const log = fetchedLogs.entries.first();
    const executor = log ? log.executor : null;

    const newCh = await channel.guild.channels.create({
      name: savedChannel.name,
      type: savedChannel.type,
      parent: savedChannel.parentId,
      reason: '🛡️ نظام الحماية: استعادة روم محذوف'
    }).catch(() => null);

    if (newCh) {
      const updatedSnapshot = getProtect(`channels_snapshot_${channel.guild.id}`) || {};
      delete updatedSnapshot[channel.id];
      updatedSnapshot[newCh.id] = { name: newCh.name, type: newCh.type, parentId: newCh.parentId, position: newCh.rawPosition };
      protectConfig.set(`channels_snapshot_${channel.guild.id}`, updatedSnapshot);
    }

    if (executor && executor.id !== channel.guild.client.user.id && executor.id !== channel.guild.ownerId && !isWhitelisted(channel.guild.id, executor.id, channel.guild.client.user.id, 'channel', await getMemberRoles(channel.guild, executor.id)) && !await isAboveBot(channel.guild, executor.id)) {
      await banMember(channel.guild, executor.id, '🛡️ حماية: حذف روم');
      await sendProtectLog(channel.guild, {
        title: '🛡️ حماية - حذف روم',
        fields: [
          { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
          { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
          { name: '📝 الروم', value: `\`#${savedChannel.name}\``, inline: false },
          { name: '🔄 الحالة', value: newCh ? `تم الاسترجاع: ${newCh}` : '❌ فشل الاسترجاع', inline: false }
        ]
      });
    }
  } catch (err) { console.error('Protection channelDelete error:', err); }
});

// ===== حماية تعديل اسم الرومات =====
client27.on('channelUpdate', async (oldChannel, newChannel) => {
  try {
    if (!newChannel.guild) return;
    if (oldChannel.name === newChannel.name) return;
    const enabled = getProtect(`anti_channel_edit_${newChannel.guild.id}`);
    if (!enabled) return;
    const snapshot = getProtect(`channels_snapshot_${newChannel.guild.id}`);
    if (!snapshot || !snapshot[newChannel.id]) return;
    const savedName = snapshot[newChannel.id].name;
    if (oldChannel.name !== savedName) return;
    await new Promise(r => setTimeout(r, 1000));
    const fetchedLogs = await newChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 });
    const log = fetchedLogs.entries.first();
    const executor = log ? log.executor : null;
    await newChannel.setName(savedName).catch(() => {});
    if (executor && executor.id !== newChannel.guild.client.user.id && executor.id !== newChannel.guild.ownerId && !isWhitelisted(newChannel.guild.id, executor.id, newChannel.guild.client.user.id, 'channel', await getMemberRoles(newChannel.guild, executor.id)) && !await isAboveBot(newChannel.guild, executor.id)) {
      await banMember(newChannel.guild, executor.id, '🛡️ حماية: تغيير اسم روم');
      await sendProtectLog(newChannel.guild, {
        title: '🛡️ حماية - تغيير اسم روم',
        fields: [
          { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
          { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
          { name: '📝 التغيير', value: `\`${oldChannel.name}\` ← \`${newChannel.name}\``, inline: false },
          { name: '✅ الحالة', value: `تم استعادة الاسم: \`${savedName}\``, inline: false }
        ]
      });
    }
  } catch (err) { console.error('Protection channelUpdate error:', err); }
});

// ====================================================
// ============ دوال مساعدة للحماية ==================
// ====================================================

async function banMember(guild, userId, reason) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;
    const botMember = guild.members.cache.get(guild.client.user.id);
    const botPos = botMember ? botMember.roles.highest.position : 0;
    const memberPos = member.roles.highest.position;
    if (botPos > memberPos) {
      const roles = member.roles.cache.filter(r => r.id !== guild.roles.everyone.id);
      await member.roles.remove(roles).catch(() => {});
    }
    await guild.bans.create(userId, { deleteMessageSeconds: 0, reason })
      .then(() => console.log(`[PROTECT] BAN SUCCESS: ${userId}`))
      .catch(e => console.error(`[PROTECT] BAN FAILED:`, e.message));
  } catch (e) { console.error('[PROTECT] banMember error:', e.message); }
}

async function sendProtectLog(guild, { title, fields }) {
  try {
    const logChannelId = getProtect(`set_protect_logs_${guild.id}`);
    if (!logChannelId) return;
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(title)
      .addFields(fields)
      .setTimestamp()
      .setFooter({ text: 'Made by STEVEN' });
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (e) {}
}

// ====================================================
// ========= أنظمة الحماية الإضافية ==================
// ====================================================

// ===== 1. حماية من الكيك الجماعي =====
const kickTracker = new Map();
client27.on('guildMemberRemove', async (member) => {
  try {
    const guild = member.guild;
    const enabled = getProtect(`anti_kick_${guild.id}`);
    if (!enabled) return;
    const limit = getProtect(`anti_kick_limit_${guild.id}`) || 3;
    await new Promise(r => setTimeout(r, 500));
    const fetchedLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
    const log = fetchedLogs.entries.first();
    if (!log || Date.now() - log.createdTimestamp > 5000) return;
    const executor = log.executor;
    if (!executor || executor.id === guild.client.user.id || executor.id === guild.ownerId) return;
    if (await isAboveBot(guild, executor.id)) return;
    if (isWhitelisted(guild.id, executor.id, guild.client.user.id, 'kick', await getMemberRoles(guild, executor.id))) return;
    const key = `${guild.id}-${executor.id}`;
    const now = Date.now();
    if (!kickTracker.has(key)) kickTracker.set(key, []);
    const times = kickTracker.get(key).filter(t => now - t < 60000);
    times.push(now);
    kickTracker.set(key, times);
    if (times.length >= limit) {
      kickTracker.delete(key);
      await banMember(guild, executor.id, '🛡️ حماية: كيك جماعي');
      await sendProtectLog(guild, {
        title: '🛡️ حماية - كيك جماعي',
        fields: [
          { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
          { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
          { name: '📊 العدد', value: `${times.length} كيك في دقيقة`, inline: false }
        ]
      });
    }
  } catch (e) {}
});

// ===== 2. حماية من إنشاء رتب جديدة =====
client27.on('roleCreate', async (role) => {
  try {
    const enabled = getProtect(`anti_role_create_${role.guild.id}`);
    if (!enabled) return;
    await new Promise(r => setTimeout(r, 500));
    const fetchedLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
    const log = fetchedLogs.entries.first();
    const executor = log ? log.executor : null;
    if (!executor || executor.id === role.guild.client.user.id || executor.id === role.guild.ownerId) return;
    if (await isAboveBot(role.guild, executor.id)) return;
    if (isWhitelisted(role.guild.id, executor.id, role.guild.client.user.id, 'role', await getMemberRoles(role.guild, executor.id))) return;
    await role.delete('🛡️ حماية: إنشاء رتبة غير مصرح').catch(() => {});
    await banMember(role.guild, executor.id, '🛡️ حماية: إنشاء رتبة');
    await sendProtectLog(role.guild, {
      title: '🛡️ حماية - إنشاء رتبة غير مصرح',
      fields: [
        { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
        { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
        { name: '📝 الرتبة', value: `\`${role.name}\``, inline: false },
        { name: '🔄 الحالة', value: 'تم حذف الرتبة تلقائياً', inline: false }
      ]
    });
  } catch (e) {}
});

// ===== 3. حماية من تعديل الرتب وصلاحياتها =====
client27.on('roleUpdate', async (oldRole, newRole) => {
  try {
    const enabled = getProtect(`anti_role_edit_${newRole.guild.id}`);
    if (!enabled) return;
    const permChanged = !oldRole.permissions.equals(newRole.permissions);
    const nameChanged = oldRole.name !== newRole.name;
    if (!permChanged && !nameChanged) return;
    await new Promise(r => setTimeout(r, 500));
    const fetchedLogs = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate, limit: 1 });
    const log = fetchedLogs.entries.first();
    const executor = log ? log.executor : null;
    if (!executor || executor.id === newRole.guild.client.user.id || executor.id === newRole.guild.ownerId) return;
    if (await isAboveBot(newRole.guild, executor.id)) return;
    if (isWhitelisted(newRole.guild.id, executor.id, newRole.guild.client.user.id, 'role', await getMemberRoles(newRole.guild, executor.id))) return;
    // Restore old name and permissions
    await newRole.setName(oldRole.name).catch(() => {});
    await newRole.setPermissions(oldRole.permissions).catch(() => {});
    await banMember(newRole.guild, executor.id, '🛡️ حماية: تعديل رتبة');
    await sendProtectLog(newRole.guild, {
      title: '🛡️ حماية - تعديل رتبة',
      fields: [
        { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
        { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
        { name: '📝 الرتبة', value: `\`${oldRole.name}\``, inline: false },
        { name: '🔄 التغيير', value: `${permChanged ? '✏️ تغيير صلاحيات\n' : ''}${nameChanged ? '🔤 تغيير اسم' : ''}`, inline: false }
      ]
    });
  } catch (e) {}
});

// ===== 4. حماية من إنشاء ويب هوكس =====
client27.on('webhookUpdate', async (channel) => {
  try {
    const enabled = getProtect(`anti_webhook_${channel.guild.id}`);
    if (!enabled) return;
    await new Promise(r => setTimeout(r, 500));
    const fetchedLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookCreate, limit: 1 });
    const log = fetchedLogs.entries.first();
    if (!log || Date.now() - log.createdTimestamp > 5000) return;
    const executor = log.executor;
    if (!executor || executor.id === channel.guild.client.user.id || executor.id === channel.guild.ownerId) return;
    if (await isAboveBot(channel.guild, executor.id)) return;
    if (isWhitelisted(channel.guild.id, executor.id, channel.guild.client.user.id, 'webhook', await getMemberRoles(channel.guild, executor.id))) return;
    // Delete the webhook
    const webhooks = await channel.fetchWebhooks().catch(() => null);
    if (webhooks) {
      const newWh = webhooks.find(w => w.owner?.id === executor.id);
      if (newWh) await newWh.delete('🛡️ حماية').catch(() => {});
    }
    await banMember(channel.guild, executor.id, '🛡️ حماية: إنشاء ويب هوك');
    await sendProtectLog(channel.guild, {
      title: '🛡️ حماية - إنشاء ويب هوك',
      fields: [
        { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
        { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
        { name: '📝 الروم', value: `${channel}`, inline: false },
        { name: '🔄 الحالة', value: 'تم حذف الويب هوك تلقائياً', inline: false }
      ]
    });
  } catch (e) {}
});

// ===== 5. حماية من إنشاء رومات جديدة =====
client27.on('channelCreate', async (channel) => {
  try {
    if (!channel.guild) return;
    const enabled = getProtect(`anti_channel_create_${channel.guild.id}`);
    if (!enabled) return;
    await new Promise(r => setTimeout(r, 500));
    const fetchedLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
    const log = fetchedLogs.entries.first();
    if (!log || Date.now() - log.createdTimestamp > 5000) return;
    const executor = log.executor;
    if (!executor || executor.id === channel.guild.client.user.id || executor.id === channel.guild.ownerId) return;
    if (await isAboveBot(channel.guild, executor.id)) return;
    if (isWhitelisted(channel.guild.id, executor.id, channel.guild.client.user.id, 'channel', await getMemberRoles(channel.guild, executor.id))) return;
    await channel.delete('🛡️ حماية: إنشاء روم غير مصرح').catch(() => {});
    await banMember(channel.guild, executor.id, '🛡️ حماية: إنشاء روم');
    await sendProtectLog(channel.guild, {
      title: '🛡️ حماية - إنشاء روم غير مصرح',
      fields: [
        { name: '👤 المخالف', value: `<@${executor.id}>`, inline: true },
        { name: '🔨 العقوبة', value: '`باند فوري`', inline: true },
        { name: '📝 الروم', value: `\`#${channel.name}\``, inline: false },
        { name: '🔄 الحالة', value: 'تم حذف الروم تلقائياً', inline: false }
      ]
    });
  } catch (e) {}
});

// ========== START DASHBOARD ==========
const { startDashboard } = require('./dashboard');
// ابدأ الداشبورد أولاً حتى يستجيب Railway للـ healthcheck فوراً
startDashboard(client27);

client27.once('ready', () => {
  console.log(`✅ Bot logged in as ${client27.user.tag}`);
});

client27.login(token);
