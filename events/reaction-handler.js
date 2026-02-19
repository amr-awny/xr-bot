const config = require('../config.json');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('rr|')) return;
    const roleId = interaction.customId.split('|')[1];
    const member = interaction.member;
    const has = member.roles.cache.has(roleId);
    try {
      if (has) {
        await member.roles.remove(roleId);
        await interaction.reply({ content: '✅ تم إزالة الرتبة عنك', ephemeral: true });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({ content: '✅ تم إضافة الرتبة لك', ephemeral: true });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '⚠️ فشل تعديل الرتبة', ephemeral: true });
    }
  });
};
