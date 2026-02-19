const fs = require('fs');
const path = require('path');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    const [action, channelId] = interaction.customId.split('|');

    // فقط تذاكر
    if (!channelId) return;
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) return interaction.reply({ content: '⚠️ القناة مش موجودة.', ephemeral: true });

    if (action === 'ticket_close') {
      // permission lock + log
      await channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: false }).catch(()=>{});
      await interaction.reply({ content: '🔒 تم قفل التذكرة — الستاف يقدر يفتحها أو يحذفها.', ephemeral: true });

      const logCh = interaction.guild.channels.cache.get(config.tickets.logChannelId);
      if (logCh) {
        logCh.send({ embeds: [ new EmbedBuilder().setTitle('🔒 تذكرة مقفولة').setDescription(`${channel.name} اتقفل بواسطة ${interaction.user.tag}`).setTimestamp() ] });
      }
    }

    if (action === 'ticket_transcript') {
      await interaction.deferReply({ ephemeral: true });
      try {
        const messages = await fetchAllMessages(channel);
        const lines = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content || (m.attachments.size ? '[Attachment]' : '')}`);
        const filePath = path.join(__dirname, '..', 'data', `transcript-${channel.id}.txt`);
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        const attachment = new AttachmentBuilder(filePath);
        await interaction.editReply({ content: '📄 هاهو الترانسكريبت:', files: [attachment], ephemeral: true });

        // optional: إرسال للروم logs
        const logCh = interaction.guild.channels.cache.get(config.tickets.logChannelId);
        if (logCh) {
          await logCh.send({ content: `🧾 Transcript for ${channel.name}`, files: [attachment] });
        }
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '⚠️ فشل توليد الترانسكريبت.' });
      }
    }
  });

  async function fetchAllMessages(channel) {
    let all = [];
    let lastId;
    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;
      const msgs = await channel.messages.fetch(options);
      if (!msgs.size) break;
      all = all.concat(Array.from(msgs.values()));
      lastId = msgs.last().id;
      if (msgs.size < 100) break;
    }
    return all;
  }
};
