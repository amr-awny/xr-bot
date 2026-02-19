const { EmbedBuilder } = require('discord.js');

module.exports = async (client, member) => {

  try {

    const cfg = client.config;

    const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

    if (!logsChannel) return;

    // حاول تحديد لو الحذف كان Kick/Ban عبر الـ Audit Logs

    let reason = 'Left the server';

    try {

      const audit = await member.guild.fetchAuditLogs({ type: 20, limit: 5 }); // 20 = MEMBER_KICK

      const entry = audit.entries.find(e => e.target.id === member.id);

      if (entry) {

        reason = `Kicked by ${entry.executor.tag}${entry.reason ? ' — ' + entry.reason : ''}`;

      } else {

        // حاول بان؟

        const banAudit = await member.guild.fetchAuditLogs({ type: 22, limit: 5 }); // 22 = MEMBER_BAN_ADD

        const bEntry = banAudit.entries.find(e => e.target.id === member.id);

        if (bEntry) reason = `Banned by ${bEntry.executor.tag}${bEntry.reason ? ' — ' + bEntry.reason : ''}`;

      }

    } catch (e) {}

    const embed = new EmbedBuilder()

      .setTitle('👋 Member Left / Removed')

      .setDescription(`${member.user.tag} — <@${member.id}>`)

      .addFields({ name: 'Status', value: reason })

      .setColor('#FFA500')

      .setTimestamp();

    await logsChannel.send({ embeds: [embed] }).catch(() => {});

  } catch (err) {

    console.error('guildMemberRemove handler error:', err);

  }

};