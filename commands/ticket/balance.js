const { EmbedBuilder } = require('discord.js');
const econ = require('../../utils/economy');

module.exports = {
  name: 'balance',
  description: 'عرض رصيدك',

  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const u = econ.getUser(target.id);
    const embed = new EmbedBuilder()
      .setTitle(`💰 رصيد ${target.username}`)
      .setDescription(`الرصيد: **${u.balance}**`)
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
};
