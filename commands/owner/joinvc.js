const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');

module.exports = {
  name: 'joinvc',
  description: 'دخول قناة صوتية وتشغيل صمت مستمر',

  async execute(message, args, client) {
    try {
      if (!message.guild.members.me.permissions.has('Connect') || !message.guild.members.me.permissions.has('Speak')) {
        return message.reply('❌ البوت محتاج صلاحيات Connect و Speak في السيرفر عشان يدخل الصوت.');
      }

      let channel = message.guild.channels.cache.get(args[0]);
      if (!channel) {
        channel = message.member?.voice?.channel;
      }

      if (!channel) {
        return message.reply('❌ رجاءً حدد روم صوتي أو كون داخل روم صوتي وأعد المحاولة. مثال: `!joinvc <channel_id>`');
      }

      if (!client._vcConnections) client._vcConnections = new Map();

      const guildKey = `${message.guild.id}`;
      if (client._vcConnections.get(guildKey)) {
        return message.reply('✅ البوت بالفعل متصل في قناة صوتية في هذا السيرفر.');
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
      });

      const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });

      const silentPath = path.join(__dirname, '..', 'silent.wav');
      if (!fs.existsSync(silentPath)) {
        return message.reply('❌ ملف silent.wav مش موجود في فولدر المشروع.');
      }

      let resource = createAudioResource(silentPath, {
        inputType: null,
        inlineVolume: false,
        ffmpegExecutable: ffmpeg
      });

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        try {
          const r = createAudioResource(silentPath, { ffmpegExecutable: ffmpeg });
          player.play(r);
        } catch (e) { console.error('loop play error', e); }
      });

      client._vcConnections.set(guildKey, { connection, player, channelId: channel.id, startedAt: Date.now() });

      await message.reply(`✅ دخلت الروم الصوتي وبدأت تشغيل صامت (silent loop) في <#${channel.id}>. هيفضل موجود طالما السيرفر شغال.`);

    } catch (err) {
      console.error('joinvc error', err);
      return message.reply('❌ حصل خطأ أثناء محاولة الدخول للكول. شوف الكونسول.');
    }
  }
};
