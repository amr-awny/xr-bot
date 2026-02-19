const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');

console.log('✅ open ticket file is running!');

module.exports = {
  name: 'ticket-open',
  description: 'افتح تذكرة دعم',

  async execute(message, args, client) {
    const guild = message.guild;
    const categoryId = config.tickets?.categoryId;
    const staffRole = config.tickets?.staffRoleId;
    if (!categoryId) return message.reply('❌ لم يتم ضبط category للتذاكر في config.json');

    console.log('✅ open ticket file is running!');
    const channelName = `ticket-${message.author.username.toLowerCase().replace(/[^a-z0-9]/g,'')}-${Date.now().toString().slice(-4)}`;

    const channel = await guild.channels.create({
      name: channelName,
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
        { id: message.author.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'ReadMessageHistory'] },
        ...(staffRole ? [{ id: staffRole, allow: ['ViewChannel', 'SendMessages', 'ManageMessages'] }] : [])
      ]
    });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`ticket_close|${channel.id}`).setLabel('🔒 غلق التذكرة').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`ticket_transcript|${channel.id}`).setLabel('📄 Transcript').setStyle(ButtonStyle.Secondary)
      );

    await channel.send({ content: `مرحبًا ${message.author}, اكتب مشكلتك هنا وسيقوم فريق الدعم بالرد.`, components: [row] });

    await message.reply(`✅ تم فتح تذكرتك: ${channel}`);
  }
};
