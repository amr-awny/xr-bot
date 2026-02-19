const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setavatar',
  description: 'تغيير صورة البوت (للأونر فقط)',

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

    const url = args[0];
    if (!url) {
      return message.reply('❌ حط رابط الصورة. مثال: `!setavatar https://example.com/image.png`');
    }

    try {
      await client.user.setAvatar(url);
      await message.reply('✅ تم تغيير صورة البوت بنجاح!');
    } catch (err) {
      console.error(err);
      await message.reply('⚠️ حدث خطأ أثناء تغيير صورة البوت.');
    }
  }
};
