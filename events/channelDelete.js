const { EmbedBuilder } = require('discord.js');

module.exports = async (client, message) => {

  const cfg = client.config;

  if (!message.guild) return;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  const embed = new EmbedBuilder()

    .setTitle('🗑️ Message Deleted')

    .setDescription(`Author: **${message.author?.tag || 'Unknown'}** in <#${message.channel.id}>`)

    .addFields({ name: 'Content', value: message.content?.slice(0, 1024) || 'Embed/Attachment' })

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};