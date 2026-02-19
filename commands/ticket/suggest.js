const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'suggest',
  description: 'ابعث اقتراح',

  async execute(message, args, client) {
    const text = args.join(' ');
    
    if (!text) return message.reply('❌ اكتب اقتراحك. الاستخدام: `!suggest <اقتراحك>`');

    const embed = new EmbedBuilder()
      .setTitle('💡 اقتراح جديد')
      .setDescription(text)
      .setFooter({ text: `By ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`suggest_accept|${message.author.id}`).setLabel('✅ قبول').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`suggest_decline|${message.author.id}`).setLabel('❌ رفض').setStyle(ButtonStyle.Danger)
    );

    const ch = message.guild.channels.cache.get(config.suggestionsChannelId);
    if (!ch) {
      await message.reply('⚠️ روم الاقتراحات مش متضبط في config.json');
      return;
    }

    const msg = await ch.send({ embeds: [embed], components: [row] });
    await message.reply('✅ تم ارسال اقتراحك. شكراً!');
  }
};
