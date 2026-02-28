// ======================================
// ====== نظام الذكاء الاصطناعي ========
// ====== يشتغل مع كل السيرفرات ========
// ======================================
const { EmbedBuilder } = require('discord.js');
const https = require('https');
const { SimpleDB } = require('../db-manager');
const { groqApiKey } = require('../config');

// قاعدة بيانات إعدادات الـ AI لكل سيرفر
const aiDB = new SimpleDB('./Json-db/AI/aiDB.json');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // جلب إعدادات السيرفر
    const settings = aiDB.get(message.guild.id);
    if (!settings || !settings.enabled) return;
    if (!settings.channelId) return;

    // الـ API Key: من إعدادات السيرفر لو موجود، وإلا من الكونفيج (الافتراضي)
    const apiKey = settings.apiKey || groqApiKey;
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey === '') return;

    // تحقق من الروم
    if (message.channel.id !== settings.channelId) return;

    // تجاهل الأوامر
    if (message.content.startsWith('!') || message.content.startsWith('/')) return;

    const question = message.content.trim();
    if (!question) return;

    try {
      await message.channel.sendTyping();
      const answer = await askGroq(
        question,
        message.author.displayName || message.author.username,
        apiKey,
        settings.model || 'llama-3.1-8b-instant'
      );

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({
          name: message.author.displayName || message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(answer.slice(0, 2000))
        .setFooter({ text: '🤖 Xtra AI • Groq' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (e) {
      console.error('[AI Error]', e.message);
      await message.reply('⚠️ خطأ في الذكاء الاصطناعي، تواصل مع مالك البوت.').catch(() => {});
    }
  });

  // رسالة تشغيل
  if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY' || groqApiKey === '') {
    console.log('⚠️ AI system: ضع GROQ_API_KEY في ملف .env');
  } else {
    console.log('✅ AI system loaded | Multi-server mode | Default key ready');
  }
};

// ===== Groq API =====
function askGroq(question, username, apiKey, model) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: `أنت مساعد ذكي اسمك Xtra AI. تتحدث العربية بطلاقة وتجيب على أي سؤال بدقة ووضوح. كن مفيداً ومختصراً. اسم المستخدم: ${username}`
        },
        { role: 'user', content: question }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${apiKey}`
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const answer = json?.choices?.[0]?.message?.content;
          if (answer) resolve(answer.trim());
          else reject(new Error(json?.error?.message || 'No response from Groq'));
        } catch (e) { reject(e); }
      });
    });

    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// تصدير DB عشان السلاش كوماند يستخدمه
module.exports.aiDB = aiDB;
