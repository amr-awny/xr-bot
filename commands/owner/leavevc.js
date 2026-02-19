const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  name: 'leavevc',
  description: 'يخلي البوت يخرج من الروم الصوتي',

  async execute(message, args, client) {
    try {
      const guild = message.guild;
      if (!guild) return message.reply('❌ لا يمكن العثور على السيرفر.');

      const connection = getVoiceConnection(guild.id);
      const voiceChannel = guild.members.me?.voice?.channel;

      if (!voiceChannel && !connection) {
        return message.reply('❌ البوت مش موجود في أي روم صوتي.');
      }

      if (connection) {
        connection.destroy();
      }

      if (client._vcConnections) {
        client._vcConnections.delete(guild.id);
      }

      return message.reply('👋 تم خروج البوت من الروم الصوتي بنجاح.');
    } catch (err) {
      console.error('❌ خطأ في leavevc:', err);
      message.reply('⚠️ حصل خطأ أثناء محاولة مغادرة الروم الصوتي.');
    }
  }
};
