const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hide',
  description: 'لإخفاء الروم الحالي',

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ معندكش صلاحية لإخفاء الروم.');
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      ViewChannel: false,
    });

    const embed = new EmbedBuilder()
      .setColor('#800080')
      .setTitle('تم إخفاء الروم 👻')
      .setDescription(`تم إخفاء الروم بواسطة <@${message.author.id}>`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
