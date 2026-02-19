const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'لفتح الشات الحالي',

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ معندكش صلاحية لفتح الشات.');
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🔓 تم فتح الشات')
      .setDescription(`تم فتح الروم بواسطة <@${message.author.id}>`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
