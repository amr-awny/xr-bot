const econ = require('../../utils/economy');

const shopItems = {
  viprole: { name: 'VIP Role', price: 1000 },
  namecolor: { name: 'Color Name', price: 500 }
};

module.exports = {
  name: 'buy',
  description: 'اشتري من المتجر',

  async execute(message, args, client) {
    const itemKey = args[0]?.toLowerCase();
    
    if (!itemKey) {
      const itemList = Object.entries(shopItems).map(([k, v]) => `\`${k}\` - ${v.name} (${v.price})`).join('\n');
      return message.reply(`❌ حدد العنصر. الاستخدام: \`!buy <item>\`\n\nالعناصر المتاحة:\n${itemList}`);
    }

    const item = shopItems[itemKey];
    if (!item) {
      const itemList = Object.entries(shopItems).map(([k, v]) => `\`${k}\` - ${v.name} (${v.price})`).join('\n');
      return message.reply(`❌ العنصر غير موجود.\n\nالعناصر المتاحة:\n${itemList}`);
    }

    const user = econ.getUser(message.author.id);
    if (user.balance < item.price) return message.reply('❌ رصيدك مش كفاية');

    user.balance -= item.price;
    econ.setUser(message.author.id, user);

    if (itemKey === 'viprole') {
      const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'vip') || null;
      if (role) await message.member.roles.add(role).catch(()=>{});
    }

    return message.reply(`✅ اشتريت **${item.name}** بـ ${item.price}`);
  }
};
