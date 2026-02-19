const econ = require('../../utils/economy');

module.exports = {
  name: 'pay',
  description: 'حوّل فلوس لحد',

  async execute(message, args, client) {
    const to = message.mentions.users.first();
    const amount = parseInt(args[1]) || parseInt(args[0]);
    
    if (!to) return message.reply('❌ منشن الشخص اللي هتحوله. الاستخدام: `!pay @user <amount>`');
    if (to.id === message.author.id) return message.reply('🚫 مستحيل تحول لنفسك');
    if (!amount || amount <= 0) return message.reply('🚫 المبلغ غلط. الاستخدام: `!pay @user <amount>`');

    const fromU = econ.getUser(message.author.id);
    if (fromU.balance < amount) return message.reply('❌ رصيدك مش كفاية');

    fromU.balance -= amount;
    econ.setUser(message.author.id, fromU);

    const toU = econ.getUser(to.id);
    toU.balance += amount;
    econ.setUser(to.id, toU);

    return message.reply(`✅ حولت ${amount} إلى ${to.tag}`);
  }
};
