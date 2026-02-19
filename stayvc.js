const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.once('ready', async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // 🟢 هنا حط ID الروم الصوتي اللي عايز البوت يدخلها
  const voiceChannelId = '1417026297003245661';
  const guild = client.guilds.cache.first();
  const channel = guild.channels.cache.get(voiceChannelId);

  if (!channel || channel.type !== 2) return console.log('❌ الكول مش موجود أو مش صوتي.');

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });

  const player = createAudioPlayer();
  const resource = createAudioResource(path.join(__dirname, '018.wav'));
  player.play(resource);
  connection.subscribe(player);

  console.log('✅ البوت دخل الكول وهيفضل فيه.');

  // لو الصوت خلص، يشغله تاني
  player.on(AudioPlayerStatus.Idle, () => {
    player.play(createAudioResource(path.join(__dirname, '018.wav')));
  });
});

client.login(process.env.BOT_TOKEN);
