const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'مسح عدد معين من الرسائل (حتى 1000)',
  
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ لا تمتلك صلاحية مسح الرسائل.');
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 1000) {
      return message.reply('❌ حط عدد صحيح من 1 إلى 1000. مثال: `!clear 50`');
    }

    await message.delete().catch(() => {});

    let deleted = 0;

    while (deleted < amount) {
      const toDelete = Math.min(amount - deleted, 100);
      const deletedMessages = await message.channel.bulkDelete(toDelete, true);
      deleted += deletedMessages.size;

      if (deletedMessages.size === 0) break;
      await new Promise(res => setTimeout(res, 1000));
    }

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🧹 تم مسح الرسائل')
      .setDescription(`> تم مسح **${deleted}** رسالة بنجاح.`)
      .setFooter({ text: 'All in One • إدارة', iconURL: client.user.displayAvatarURL() });

    const msg = await message.channel.send({ embeds: [embed] });
    setTimeout(() => msg.delete().catch(() => {}), 5000);
  },
};
