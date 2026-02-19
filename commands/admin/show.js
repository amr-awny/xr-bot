const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'show',
  description: 'لإظهار الروم الحالي',

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ معندكش صلاحية لإظهار الروم.');
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      ViewChannel: true,
    });

    const embed = new EmbedBuilder()
      .setColor('#00ffff')
      .setTitle('تم إظهار الروم 👀')
      .setDescription(`تم إظهار الروم بواسطة <@${message.author.id}>`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
