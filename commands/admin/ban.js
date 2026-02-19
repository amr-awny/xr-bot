const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'يحظر عضو من السيرفر',
  
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ ماعندكش صلاحية البان.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('❌ منشن الشخص أو حط الـ ID. مثال: `!ban @user سبب`');
    }

    const member = message.guild.members.cache.get(user.id);
    const reason = args.slice(1).join(' ') || 'بدون سبب';

    if (!member) {
      return message.reply('❌ العضو مش موجود في السيرفر.');
    }

    if (!member.bannable) {
      return message.reply('❌ مش قادر أعمل بان للشخص ده.');
    }

    await member.ban({ reason });

    const embed = new EmbedBuilder()
      .setTitle('🔨 تم حظر عضو')
      .addFields(
        { name: '👤 العضو', value: `${user.tag}`, inline: true },
        { name: '🧑‍⚖️ بواسطة', value: `${message.author.tag}`, inline: true },
        { name: '📄 السبب', value: reason }
      )
      .setColor('#9b59b6');

    await message.reply({ embeds: [embed] });
  }
};
