const { EmbedBuilder } = require('discord.js');

const shopItems = [
  { id: 'viprole', name: 'VIP Role', price: 1000, description: 'احصل على رتبة VIP' },
  { id: 'namecolor', name: 'Color Name', price: 500, description: 'تغيير لون الأسم (by staff)' }
];

module.exports = {
  name: 'shop',
  description: 'عرض المتجر',

  async execute(message, args, client) {
    const embed = new EmbedBuilder().setTitle('🛒 المتجر').setDescription(shopItems.map(i=>`**${i.name}** — ${i.price}\n${i.description}`).join('\n\n'));
    await message.reply({ embeds: [embed] });
  }
};
