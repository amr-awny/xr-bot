const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setprefix',
  description: 'تغيير بريفكس البوت (للأونر فقط)',

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

    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply('❌ اكتب البريفكس الجديد. مثال: `!setprefix .`');
    }
    
    try {
      client.prefix = newPrefix;
      config.prefix = newPrefix;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      await message.reply(`✅ تم تغيير البريفكس إلى: \`${newPrefix}\``);
    } catch (err) {
      console.error(err);
      await message.reply('⚠️ حدث خطأ أثناء تغيير البريفكس.');
    }
  }
};
