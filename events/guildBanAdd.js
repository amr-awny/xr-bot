const { EmbedBuilder } = require('discord.js');

module.exports = async (client, guild, user) => {

  const cfg = client.config;

  const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

  if (!logsChannel) return;

  // حاول جلب سبب من audit logs

  let reason = 'No reason';

  try {

    const audit = await guild.fetchAuditLogs({ type: 22, limit: 5 });

    const entry = audit.entries.find(e => e.target.id === user.id);

    if (entry) reason = entry.reason || `By ${entry.executor.tag}`;

  } catch (e) {}

  const embed = new EmbedBuilder()

    .setTitle('🔨 Member Banned')

    .setDescription(`${user.tag} (${user.id})`)

    .addFields({ name: 'Reason', value: reason })

    .setTimestamp();

  await logsChannel.send({ embeds: [embed] }).catch(() => {});

};