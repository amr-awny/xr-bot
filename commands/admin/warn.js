const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'warn',
  description: 'تحذير عضو معين',
  
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ ماعندكش صلاحية التحذير.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('❌ منشن الشخص أو حط الـ ID. مثال: `!warn @user سبب`');
    }

    const reason = args.slice(1).join(' ') || 'بدون سبب';

    const embed = new EmbedBuilder()
      .setTitle('⚠️ تم تحذير عضو')
      .addFields(
        { name: '👤 العضو', value: `${user.tag}`, inline: true },
        { name: '🧑‍⚖️ بواسطة', value: `${message.author.tag}`, inline: true },
        { name: '📄 السبب', value: reason }
      )
      .setColor('#9b59b6');

    await message.reply({ embeds: [embed] });
  }
};
