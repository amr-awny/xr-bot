const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setname',
  description: 'يغير اسم البوت داخل السيرفر',

  async execute(message, args, client) {
    const configPath = path.join(__dirname, '../../config.json');
    let config = {};
    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading config:', err);
    }

    const allowedOwners = config?.owners || ['1042648956494155837', '1429871149126520853'];
    if (!allowedOwners.includes(message.author.id)) {
      return message.reply('🚫 هذا الأمر مخصص للأونر فقط.');
    }

    const newName = args.join(' ');
    if (!newName) {
      return message.reply('❌ اكتب الاسم الجديد. مثال: `!setname اسم البوت`');
    }

    try {
      await message.guild.members.me.setNickname(newName);
      await message.reply(`✅ تم تغيير اسم البوت داخل السيرفر إلى: **${newName}**`);
    } catch (error) {
      console.error(error);
      await message.reply('⚠️ حصل خطأ أثناء تغيير الاسم.');
    }
  }
};
