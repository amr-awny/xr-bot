const { EmbedBuilder } = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {

  const cfg = client.config;

  if (!oldMessage.guild) return;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  if (oldMessage.content === newMessage.content) return; // تجاهل التعديلات غير النصية

  const embed = new EmbedBuilder()

    .setTitle('✏️ Message Edited')

    .setDescription(`Author: **${oldMessage.author?.tag || 'Unknown'}** in <#${oldMessage.channel.id}>`)

    .addFields(

      { name: 'Before', value: oldMessage.content?.slice(0, 1024) || '—' },

      { name: 'After', value: newMessage.content?.slice(0, 1024) || '—' }

    )

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};