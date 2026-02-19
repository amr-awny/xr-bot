const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'removerole',
  description: 'إزالة رول من مستخدم',
  
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('❌ لا تمتلك صلاحية إدارة الرتب.');
    }

    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply('❌ منشن الشخص والرول. مثال: `!removerole @user @role`');
    }

    const member = message.guild.members.cache.get(user.id);
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if (!member) {
      return message.reply('❌ العضو مش موجود في السيرفر.');
    }

    if (!role) {
      return message.reply('❌ منشن الرول أو حط الـ ID. مثال: `!removerole @user @role`');
    }

    try {
      await member.roles.remove(role);
      
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🗑️ تم إزالة الرتبة')
        .setDescription(`> المستخدم: ${member}\n> الرتبة: ${role}`)
        .setFooter({ text: 'All in One • إدارة', iconURL: client.user.displayAvatarURL() });
      
      await message.reply({ embeds: [embed] });
    } catch (err) {
      await message.reply('❌ حدث خطأ أثناء إزالة الرتبة.');
    }
  },
};
