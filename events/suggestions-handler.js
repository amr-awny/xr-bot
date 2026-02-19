const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('suggest_')) return;

    const [action, userId] = interaction.customId.split('|');
    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.reply({ content: '🚫 مش صلاحياتك.', ephemeral: true });
    }

    const msg = interaction.message;
    const embed = msg.embeds[0]?.data ? new EmbedBuilder(msg.embeds[0].data) : new EmbedBuilder().setDescription('No data');

    if (action === 'suggest_accept') {
      embed.setColor('Green').addFields({ name: 'الحالة', value: '✅ Accepted' });
      await msg.edit({ embeds: [embed], components: [] });
      await interaction.reply({ content: '✅ تم قبول الاقتراح', ephemeral: true });
      // notify author
      try {
        const user = await client.users.fetch(userId);
        await user.send(`اقتراحك تم قبوله في ${interaction.guild.name}`);
      } catch {}
    } else if (action === 'suggest_decline') {
      embed.setColor('Red').addFields({ name: 'الحالة', value: '❌ Declined' });
      await msg.edit({ embeds: [embed], components: [] });
      await interaction.reply({ content: '✅ تم رفض الاقتراح', ephemeral: true });
      try {
        const user = await client.users.fetch(userId);
        await user.send(`اقتراحك تم رفضه في ${interaction.guild.name}`);
      } catch {}
    }
  });
};
