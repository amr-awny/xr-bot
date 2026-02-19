const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'come',
  description: 'ينادي على شخص برسالة خاصة',

  async execute(message, args, client) {
    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('❌ منشن الشخص. مثال: `!come @user`');
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('📩 عندك رسالة جديدة!')
      .setDescription(`> ${message.author} بينادي عليك`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'All in One • تفاعل', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      await message.reply(`✅ تم إرسال النداء إلى ${user.tag}`);
    } catch (err) {
      await message.reply('❌ مقدرتش أبعتله، يمكن قافل الرسائل الخاصة.');
    }
  },
};
