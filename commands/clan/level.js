const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '..', 'levels.json');

function loadLevels() {
  if (!fs.existsSync(levelsPath)) fs.writeFileSync(levelsPath, JSON.stringify({}, null, 2));
  return JSON.parse(fs.readFileSync(levelsPath));
}

function saveLevels(data) {
  fs.writeFileSync(levelsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'level',
  description: 'إدارة أو عرض الليفل (خاص بالأدمن)',

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ هذا الأمر مخصص فقط للإدمن.');
    }

    const action = args[0];
    const type = args[1];
    const target = message.mentions.users.first() || message.author;

    if (!action) {
      return message.reply('❌ الاستخدام: `!level +1 scrim` أو `!level show` أو `!level show @user`');
    }

    const levels = loadLevels();

    if (!levels[target.id]) {
      levels[target.id] = { level: 0, lastScrim: null };
    }

    const userData = levels[target.id];
    const today = new Date().toISOString().slice(0, 10);

    if (action === '+1' && type === 'scrim') {
      if (userData.lastScrim === today) {
        return message.reply(`❌ ${target.username} حصل بالفعل على لفل اليوم.`);
      }

      userData.level += 1;
      userData.lastScrim = today;
      saveLevels(levels);

      const embed = new EmbedBuilder()
        .setColor(0x00ff99)
        .setTitle('🏆 تمت إضافة لفل جديد!')
        .setDescription(`> ${target.username} زاد لفل 🎯\n> اللّفل الحالي: **${userData.level}**`)
        .setFooter({ text: 'نظام الليفل • All in One' });

      return message.reply({ embeds: [embed] });
    }

    if (action === 'show') {
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📊 لفل ${target.username}`)
        .setDescription(`> اللّفل الحالي: **${userData.level}**\n> آخر سكريم: **${userData.lastScrim || 'ما لعبش لسه'}**`)
        .setFooter({ text: 'نظام الليفل • All in One' });

      return message.reply({ embeds: [embed] });
    }

    return message.reply('❌ الصيغة غلط! استخدم `!level +1 scrim` أو `!level show`');
  },
};
