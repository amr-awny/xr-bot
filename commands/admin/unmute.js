const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'إلغاء إسكات مستخدم',
  
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('❌ لا تمتلك صلاحية إسكات الأعضاء.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('❌ منشن الشخص أو حط الـ ID. مثال: `!unmute @user`');
    }

    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      return message.reply('❌ العضو مش موجود في السيرفر.');
    }

    try {
      await member.timeout(null);
      
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🔈 تم إلغاء الإسكات')
        .setDescription(`> المستخدم: ${member}`)
        .setFooter({ text: 'All in One • إدارة', iconURL: client.user.displayAvatarURL() });
      
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply('❌ فشل في إلغاء الإسكات.');
    }
  },
};
