const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function decorateText(text) {
    const decorations = {
        'a': ['𝖆', '𝒶', '𝓪', '𝔞', 'ⓐ', '🅐', 'ᴀ', 'ａ'],
        'b': ['𝖇', '𝒷', '𝓫', '𝔟', 'ⓑ', '🅑', 'ʙ', 'ｂ'],
        'c': ['𝖈', '𝒸', '𝓬', '𝔠', 'ⓒ', '🅒', 'ᴄ', 'ｃ'],
        'd': ['𝖉', '𝒹', '𝓭', '𝔡', 'ⓓ', '🅓', 'ᴅ', 'ｄ'],
        'e': ['𝖊', '𝑒', '𝓮', '𝔢', 'ⓔ', '🅔', 'ᴇ', 'ｅ'],
        'f': ['𝖋', '𝒻', '𝓯', '𝔣', 'ⓕ', '🅕', 'ғ', 'ｆ'],
        'g': ['𝖌', '𝑔', '𝓰', '𝔤', 'ⓖ', '🅖', 'ɢ', 'ｇ'],
        'h': ['𝖍', '𝒽', '𝓱', '𝔥', 'ⓗ', '🅗', 'ʜ', 'ｈ'],
        'i': ['𝖎', '𝒾', '𝓲', '𝔦', 'ⓘ', '🅘', 'ɪ', 'ｉ'],
        'j': ['𝖏', '𝒿', '𝓳', '𝔧', 'ⓙ', '🅙', 'ᴊ', 'ｊ'],
        'k': ['𝖐', '𝓀', '𝓴', '𝔨', 'ⓚ', '🅚', 'ᴋ', 'ｋ'],
        'l': ['𝖑', '𝓁', '𝓵', '𝔩', 'ⓛ', '🅛', 'ʟ', 'ｌ'],
        'm': ['𝖒', '𝓂', '𝓶', '𝔪', 'ⓜ', '🅜', 'ᴍ', 'ｍ'],
        'n': ['𝖓', '𝓃', '𝓷', '𝔫', 'ⓝ', '🅝', 'ɴ', 'ｎ'],
        'o': ['𝖔', '𝑜', '𝓸', '𝔬', 'ⓞ', '🅞', 'ᴏ', 'ｏ'],
        'p': ['𝖕', '𝓅', '𝓹', '𝔭', 'ⓟ', '🅟', 'ᴘ', 'ｐ'],
        'q': ['𝖖', '𝓆', '𝓺', '𝔮', 'ⓠ', '🅠', 'ǫ', 'ｑ'],
        'r': ['𝖗', '𝓇', '𝓻', '𝔯', 'ⓡ', '🅡', 'ʀ', 'ｒ'],
        's': ['𝖘', '𝓈', '𝓼', '𝔰', 'ⓢ', '🅢', 'ꜱ', 'ｓ'],
        't': ['𝖙', '𝓉', '𝓽', '𝔱', 'ⓣ', '🅣', 'ᴛ', 'ｔ'],
        'u': ['𝖚', '𝓊', '𝓾', '𝔲', 'ⓤ', '🅤', 'ᴜ', 'ｕ'],
        'v': ['𝖛', '𝓋', '𝓿', '𝔳', 'ⓥ', '🅥', 'ᴠ', 'ｖ'],
        'w': ['𝖜', '𝓌', '𝔀', '𝔴', 'ⓦ', '🅦', 'ᴡ', 'ｗ'],
        'x': ['𝖝', '𝓍', '𝔁', '𝔵', 'ⓧ', '🅧', 'x', 'ｘ'],
        'y': ['𝖞', '𝓎', '𝔂', '𝔶', 'ⓨ', '🅨', 'ʏ', 'ｙ'],
        'z': ['𝖟', '𝓏', '𝔃', '𝔷', 'ⓩ', '🅩', 'ᴢ', 'ｚ']
    };

    let results = ['', '', '', '', '', '', '', ''];
    
    for (let char of text.toLowerCase()) {
        if (decorations[char]) {
            for (let i = 0; i < 8; i++) {
                results[i] += decorations[char][i];
            }
        } else {
            for (let i = 0; i < 8; i++) {
                results[i] += char;
            }
        }
    }
    
    return results;
}

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('decorate')
        .setDescription('زخرفة النصوص بأشكال مختلفة')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('النص المراد زخرفته')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false })

        const text = interaction.options.getString('text');
        const decorated = decorateText(text);

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('✨ زخرفة النص')
            .setDescription(`**النص الأصلي:** ${text}`)
            .addFields(
                { name: '1️⃣ النمط الأول', value: `\`${decorated[0]}\``, inline: false },
                { name: '2️⃣ النمط الثاني', value: `\`${decorated[1]}\``, inline: false },
                { name: '3️⃣ النمط الثالث', value: `\`${decorated[2]}\``, inline: false },
                { name: '4️⃣ النمط الرابع', value: `\`${decorated[3]}\``, inline: false },
                { name: '5️⃣ النمط الخامس', value: `\`${decorated[4]}\``, inline: false },
                { name: '6️⃣ النمط السادس', value: `\`${decorated[5]}\``, inline: false },
                { name: '7️⃣ النمط السابع', value: `\`${decorated[6]}\``, inline: false },
                { name: '8️⃣ النمط الثامن', value: `\`${decorated[7]}\``, inline: false }
            )
            .setFooter({ text: `Made by STEVEN`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()

        return interaction.editReply({ embeds: [embed] })
    }
}
