const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'reaction-setup',
  description: 'انشر رسالة Reaction Roles',

  async execute(message, args, client) {
    const roleId = args[0];
    const emoji = args[1];
    
    if (!roleId || !emoji) {
      return message.reply('❌ الاستخدام: `!reaction-setup <roleId> <emoji>`\nمثال: `!reaction-setup 123456789 🔴`');
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`rr|${roleId}`).setLabel(`احصل على الرول`).setEmoji(emoji).setStyle(ButtonStyle.Primary)
    );
    await message.channel.send({ content: `اضغط البوتون للحصول على <@&${roleId}>`, components: [row] });
    await message.reply('✅ تم نشر رسالة الـ Reaction Role');
  }
};
