module.exports = {
  name: 'ticket-close',
  description: 'قفل التذكرة (للستاف)',

  async execute(message, args, client) {
    const config = require('../../config.json');
    if (!message.member.roles.cache.has(config.tickets?.staffRoleId)) {
      return message.reply('🚫 فقط الستاف يقدر يقفل التذاكر.');
    }

    const channel = message.channel;
    if (!channel.name.startsWith('ticket-')) {
      return message.reply('🚫 الأمر لا يعمل في قناة عادية.');
    }

    const overwrites = channel.permissionOverwrites.cache;
    for (const [id, overwrite] of overwrites) {
      if (overwrite.type === 1 && id !== message.author.id) {
        await channel.permissionOverwrites.edit(id, { ViewChannel: false, SendMessages: false });
      }
    }

    await message.reply('✅ تم قفل التذكرة. لم يعد بإمكان صاحب التذكرة رؤيتها.');
  }
};
