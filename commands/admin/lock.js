const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'lock',
  description: 'لقفل الشات الحالي',

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ معندكش صلاحية لقفل الشات.');
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔒 تم قفل الشات')
      .setDescription(`تم قفل الروم بواسطة <@${message.author.id}>`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
