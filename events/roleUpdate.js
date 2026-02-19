const { EmbedBuilder } = require('discord.js');

module.exports = async (client, oldRole, newRole) => {

  const cfg = client.config;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  const embed = new EmbedBuilder()

    .setTitle('✏️ Role Updated')

    .setDescription(`Role **${oldRole.name}** updated`)

    .addFields(

      { name: 'Old Name', value: oldRole.name, inline: true },

      { name: 'New Name', value: newRole.name, inline: true }

    )

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};