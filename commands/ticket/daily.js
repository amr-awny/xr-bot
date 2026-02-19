const { EmbedBuilder } = require('discord.js');
const econ = require('../../utils/economy');
const config = require('../../config.json');

module.exports = {
  name: 'daily',
  description: 'خد مكافأة يومية',

  async execute(message, args, client) {
    const userId = message.author.id;
    const u = econ.getUser(userId);
    const today = new Date().toISOString().slice(0,10);
    if (u.lastDaily === today) return message.reply('⏳ استلمت الdaily اليوم بالفعل.');

    u.balance += (config.economy?.dailyAmount || 500);
    u.lastDaily = today;
    econ.setUser(userId, u);

    const embed = new EmbedBuilder()
      .setTitle('💵 Daily')
      .setDescription(`اخدّت ${config.economy?.dailyAmount || 500} ${config.economy?.currency || ''}\nالرصيد الآن: **${u.balance}**`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
