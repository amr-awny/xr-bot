const { EmbedBuilder } = require('discord.js');

module.exports = async (client, role) => {

  const cfg = client.config;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  const embed = new EmbedBuilder()

    .setTitle('🛡️ Role Created')

    .setDescription(`Role **${role.name}** created`)

    .addFields({ name: 'ID', value: role.id })

    .setColor('#6f00ff')

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};