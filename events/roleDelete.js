const { EmbedBuilder } = require('discord.js');

module.exports = async (client, role) => {

  const cfg = client.config;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  const embed = new EmbedBuilder()

    .setTitle('🗑️ Role Deleted')

    .setDescription(`Role **${role.name}** deleted`)

    .addFields({ name: 'ID', value: role.id })

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};