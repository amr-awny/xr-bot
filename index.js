require('dotenv').config();

const fs = require('fs');

function saveConfig(newConfig) {
  fs.writeFileSync('./config.json', JSON.stringify(newConfig, null, 2));
}
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');

const autoReplies = require('./autoReplies.json');

const {
Client,
GatewayIntentBits,
Collection,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
InteractionType,
StringSelectMenuBuilder,
AttachmentBuilder
} = require('discord.js');


// إنشاء الكلاينت
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});




client.commands = new Collection();

// تحميل ملفات البيانات
const configFile = path.join(__dirname, 'config.json');
const scrimsFile = path.join(__dirname, 'commands/scrims.json');

let config = fs.existsSync(configFile)
? JSON.parse(fs.readFileSync(configFile, 'utf8'))
: { channels: {}, messages: {} };

let scrims = fs.existsSync(scrimsFile)
? JSON.parse(fs.readFileSync(scrimsFile, 'utf8'))
: {};
client.prefix = config.prefix || '.';

console.log('✅ Loaded scrims:', Object.keys(scrims));

// حفظ الملفات
function saveData() {
fs.writeFileSync(scrimsFile, JSON.stringify(scrims, null, 2));
fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

// ✅ عند تشغيل البوت



client.on('ready', async () => {
  console.log(`${client.user.tag} جاهز!`);
  const voiceChannelId = '1445204145685659850';
  const guildId = '1107802400443617330';
  
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return console.log("❌ مش لاقي السيرفر بالـ ID ده.");

  const voiceChannel = guild.channels.cache.get(voiceChannelId);
  if (!voiceChannel) return console.log("❌ مش لاقي القناة الصوتية.");

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    console.log("✅ البوت دخل القناة الصوتية!");

    // تشغيل الصوت
    const player = createAudioPlayer();
    const soundPath = path.join(__dirname, '018.mp3'); // لازم الملف يكون بنفس المجلد
    const resource = createAudioResource(soundPath);
    
    player.play(resource);
    connection.subscribe(player);

    console.log('✅ البوت دخل الكول وهيفضل فيه.');

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('🎵 الصوت شغّال...');
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('✅ الصوت خلص.');
      // لو عايز يخرج بعد الصوت:
      // connection.destroy();
    });
    
  } catch (err) {
    console.error("⚠️ حصل خطأ أثناء محاولة دخول الكول:", err);
  }

  client.user.setActivity('𝐄𝐋¹ ᴢ ᴇ ᴛ 𝐒𝐘𝐒𝐓𝐄𝐌 /help', { type: 1, url:'https://twitch.tv/elbragely'}); 
});

// setup
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  // تعديل قناة
  if (interaction.customId.startsWith('edit_')) {
    const key = interaction.customId.replace('edit_', '');
    const newId = interaction.fields.getTextInputValue('newId');

    if (!config.channels[key])
      return interaction.reply({
        content: '❌ القناة غير موجودة في الإعدادات.',
        ephemeral: true
      });

    config.channels[key] = newId;
    saveConfig(config);

    return interaction.reply({
      content: `✅ تم تحديث قناة **${key}** إلى \`${newId}\``,
      ephemeral: true
    });
  }

  // تعديل رسالة
  if (interaction.customId === 'edit_messages') {
    const newMsg = interaction.fields.getTextInputValue('newMessage');
    config.messages.openRegistration = newMsg;
    saveConfig(config);

    return interaction.reply({
      content: '✅ تم تحديث رسالة التسجيل بنجاح.',
      ephemeral: true
    });
  }

  // إضافة صورة
  if (interaction.customId === 'add_image') {
    const imageUrl = interaction.fields.getTextInputValue('imageUrl');
    config.messages.image = imageUrl;
    saveConfig(config);

    return interaction.reply({
      content: '✅ تم إضافة الصورة بنجاح.',
      ephemeral: true
    });
  }
});


// تحميل الأوامر تلقائيًا من مجلد commands
function loadCommands(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // لو فولدر، نعيد نفس الدالة جوه
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const cmd = require(fullPath);

      // دعم slash commands (data property) والأوامر القديمة (name property)
      if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        console.log(`✅ Loaded slash command: ${cmd.data.name}`);
      } else if (cmd.name && cmd.execute) {
        client.commands.set(cmd.name, cmd);
        console.log(`✅ Loaded command: ${cmd.name}`);
      }
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) loadCommands(commandsPath);

// ==============================
// Helper: ensure results structure exists for a scrim/team
// ==============================
function ensureResultsStructure(scrimId) {
if (!scrims[scrimId]) return false;
if (!scrims[scrimId].results) scrims[scrimId].results = {};
// ensure every member has a results entry
const members = scrims[scrimId].members || [];
for (const m of members) {
if (!scrims[scrimId].results[m.id]) {
scrims[scrimId].results[m.id] = {
teamName: m.name,
rounds: {
round1: null,
round2: null,
round3: null
}
};
} else {
// keep teamName synced
scrims[scrimId].results[m.id].teamName = m.name;
if (!scrims[scrimId].results[m.id].rounds) scrims[scrimId].results[m.id].rounds = { round1: null, round2: null, round3: null };
}
}
return true;
}

// التعامل مع الرسائل
client.on('messageCreate', async message => {
if (message.author.bot) return;

// ✅ Auto Replies بدون prefix
const content = message.content.trim().toLowerCase();
const key = Object.keys(autoReplies)
  .find(k => k.toLowerCase() === content);

if (key) {
  await message.channel.send(autoReplies[key].response);
  return;
}

// ✅ أوامر بالـ prefix
if (!message.content.startsWith(client.prefix)) return;

const args = message.content.slice(client.prefix.length).trim().split(/ +/);
let commandName = args.shift().toLowerCase();

// ✅ دعم أوامر من كلمتين زي result calculator
if (args[0]) {
  const twoWord = `${commandName} ${args[0]}`.toLowerCase();
  if (client.commands.has(twoWord)) {
    commandName = twoWord;
    args.shift();
  }
}



// ✅ أوامر السكرم الخاصة
if (commandName === 'scrim') {
try {
require('./commands/ticket/balance')(client);
const scrimCreate = require('./commands/scrim/scrim-create');
const scrimStart = require('./commands/scrim/scrim-start');
require("./events/guildEvents")(client);
require('./events/tickets-handler')(client);
require('./events/reaction-handler')(client);
require('./events/suggestions-handler')(client);


  if (args[0]?.toLowerCase() === 'create') {
    await scrimCreate.execute(message, args, client, scrims, config, saveData);
  } else if (args[0]?.toLowerCase() === 'start') {
    await scrimStart.execute(message, args, client, scrims);
  } else {
    return message.reply('❌ استخدم: `!scrim create ...` أو `!scrim start ...`');
  }
} catch (err) {
  console.error(err);
  return message.reply('❌ حصل خطأ أثناء تنفيذ أمر السكرم.');
}
return;

}

// ✅ باقي الأوامر من مجلد commands
const command = client.commands.get(commandName);
if (!command) return;

// 🔄 التحقق من نوع الأمر
if (command.data) {
  // هذا أمر slash command، أرشد المستخدم
  return message.reply(`⚠️ هذا الأمر تم تحويله إلى Slash Command. استخدم \`/${commandName}\` بدلاً من \`${client.prefix}${commandName}\``);
}

// 🧠 تحقق لو الأمر خاص بالأونر
const ownerCommands = ['addowner', 'removeowner', 'setavatar', 'setavatar', 'setbanner', 'setname', 'setprefix', 'setstatus', 'setup']; // حط أسماء أوامر الأونر هنا
const allowedOwners = ['1042648956494155837', '1429871149126520853']; // حط هنا IDs أصحاب البوت

if (ownerCommands.includes(commandName) && !allowedOwners.includes(message.author.id)) {
  return message.reply('🚫 الأمر ده مخصص للأونر فقط.');
}

try {
  await command.execute(message, args, client, scrims, config, saveData);
} catch (err) {
  console.error(err);
  message.reply('❌ حصل خطأ أثناء تنفيذ الأمر.');
}
});

// التعامل مع التفاعلات (slash commands, مودال وأزرار)
client.on('interactionCreate', async interaction => {
try {

// =========================
// ✅ Slash Commands Handler
// =========================
if (interaction.isChatInputCommand()) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return interaction.reply({ content: '❌ الأمر غير موجود!', ephemeral: true });
  }

  try {
    // تمرير المتغيرات المطلوبة للأوامر
    await command.execute(interaction, [], client, scrims, config, saveData);
  } catch (error) {
    console.error('Error executing slash command:', error);
    const replyMethod = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    await interaction[replyMethod]({ 
      content: '❌ حدث خطأ أثناء تنفيذ الأمر.', 
      ephemeral: true 
    }).catch(() => {});
  }
  return;
}

// =========================
// ✅ أزرار Dashboard
// =========================
if (interaction.isButton() && interaction.customId.startsWith('dash_')) {


// 🆕 زرار إنشاء سكرم جديد
if (interaction.isButton() && interaction.customId === 'dash_new_scrim') {
  const modal = new ModalBuilder()
    .setCustomId('modal_new_scrim')
    .setTitle('🆕 إنشاء سكرم جديد');

  const scrimTime = new TextInputBuilder()
    .setCustomId('scrimTime')
    .setLabel('⏰ وقت السكرم (مثلاً 22:00)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const spareTime = new TextInputBuilder()
    .setCustomId('spareTime')
    .setLabel('🕐 وقت الاحتياطي (مثلاً 22:15)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const startTime = new TextInputBuilder()
    .setCustomId('startTime')
    .setLabel('🚀 وقت البداية (مثلاً 22:30)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const mapType = new TextInputBuilder()
    .setCustomId('mapType')
    .setLabel('🗺️ رقم الماب (1-5)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const mode = new TextInputBuilder()
    .setCustomId('mode')
    .setLabel('⚙️ الحالة (on/off)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('اكتب on لو عايز روم الطلبات يشتغل');

  modal.addComponents(
    new ActionRowBuilder().addComponents(scrimTime),
    new ActionRowBuilder().addComponents(spareTime),
    new ActionRowBuilder().addComponents(startTime),
    new ActionRowBuilder().addComponents(mapType),
    new ActionRowBuilder().addComponents(mode)
  );

  await interaction.showModal(modal);
  return;
}


// =========================
//🚀 زرار Start a Scrim 
// =========================
if (interaction.isButton() && interaction.customId === 'dash_start_scrim') {
  const modal = new ModalBuilder()
    .setCustomId('modal_start_scrim')
    .setTitle('🚀 Start a Scrim');

  const scrimTime = new TextInputBuilder()
    .setCustomId('scrimTime')
    .setLabel('🕒 وقت السكرم (مثلاً 22:00)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const mapName = new TextInputBuilder()
    .setCustomId('mapName')
    .setLabel('🗺️ اسم الماب (Erangel/Miramar/Sanhok)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const roomId = new TextInputBuilder()
    .setCustomId('roomId')
    .setLabel('🆔 ID الروم')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const password = new TextInputBuilder()
    .setCustomId('password')
    .setLabel('🔑 الباسورد')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const startTime = new TextInputBuilder()
    .setCustomId('startTime')
    .setLabel('🚀 وقت البداية (مثلاً 22:30)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(scrimTime),
    new ActionRowBuilder().addComponents(mapName),
    new ActionRowBuilder().addComponents(roomId),
    new ActionRowBuilder().addComponents(password),
    new ActionRowBuilder().addComponents(startTime)
  );

  await interaction.showModal(modal);
  return;
}



// =========================
// 📜 زرار List of Scrims
// =========================
if (interaction.customId === 'dash_list_scrims') {
  // 📂 اقرأ الملف من جديد عشان تجيب آخر التحديثات
  const scrimsPath = path.join(__dirname, 'commands/scrims.json');
  if (!fs.existsSync(scrimsPath)) {
    return interaction.reply({ content: '📭 مفيش أي سكريمات حالياً.', flags: 64 });
  }

  const scrimsData = JSON.parse(fs.readFileSync(scrimsPath, 'utf8'));
  const scrimEntries = Object.entries(scrimsData);

  if (scrimEntries.length === 0) {
    return interaction.reply({ content: '📭 مفيش أي سكريمات حالياً.', flags: 64 });
  }

  let desc = '';
  for (const [scrimId, data] of scrimEntries) {
    const status = data.status === 'started'
      ? '✅ **Started**'
      : data.status === 'ended'
      ? '🔴 **Ended**'
      : '🟡 **Not Started**';

    const regState = data.registration === 'closed'
      ? '🚫 Closed'
      : '🟢 Open';

    desc += `**${data.scrimTime || scrimId}** — ${status} (${regState})\n`;
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 قائمة السكرمز الحالية')
    .setDescription(desc)
    .setColor('#6f00ff')
    .setTimestamp();

  return interaction.reply({ embeds: [embed], ephemeral: true });
}



  const modal = new ModalBuilder();

  if (interaction.customId === 'dash_delete_scrim') modal.setCustomId('modal_delete_scrim').setTitle('🗑️ حذف السكرم');
  if (interaction.customId === 'dash_end_scrim') modal.setCustomId('modal_end_scrim').setTitle('✅ إنهاء السكرم');
  if (interaction.customId === 'dash_open_reg')modal.setCustomId('modal_open_reg').setTitle('🟢 فتح التسجيل');
  if (interaction.customId === 'dash_close_reg') modal.setCustomId('modal_close_reg').setTitle('🚫 قفل التسجيل');
  if (interaction.customId === 'dash_toggle_spare') modal.setCustomId('modal_toggle_spare').setTitle('🔁 فتح/قفل التسجيل الاحتياطي');

  if (interaction.customId === 'dash_edit_time') {
    modal.setCustomId('modal_edit_time').setTitle('🕒 تعديل وقت السكرم');
    const oldTime = new TextInputBuilder().setCustomId('oldTime').setLabel('الوقت القديم (مثلاً 00:00)').setStyle(TextInputStyle.Short).setRequired(true);
    const newTime = new TextInputBuilder().setCustomId('newTime').setLabel('الوقت الجديد (مثلاً 00:30)').setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(oldTime),
      new ActionRowBuilder().addComponents(newTime)
    );
    await interaction.showModal(modal);
    return;
  }

  // باقي مودالات الوقت الواحد
  const timeInput = new TextInputBuilder()
    .setCustomId('scrimTime')
    .setLabel('وقت السكرم (مثلاً 00:00)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(timeInput));
  await interaction.showModal(modal);
  return; // مهم جداً علشان ما يكملش لباقي الكود
}

// =========================
// ✅ Result Calculator: Buttons (Round1/2/3/Double/Total)
// =========================
// زرار الراند: يبدأ سلسلة الاختيار (يبعت سيلكت منيو)
if (interaction.isButton() && interaction.customId.startsWith('rc_round')) {
  // customId format: rc_round1|<scrimId>
  const [ , roundPart, scrimId ] = interaction.customId.split('|');
  if (!scrimId || !scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });

  // ensure results structure
  ensureResultsStructure(scrimId);
  const members = scrims[scrimId].members || [];
  if (!members.length) return interaction.reply({ content: '❌ مفيش فرق مسجّلة في السكرم ده.', flags: 64 });

  const select = new StringSelectMenuBuilder()
    .setCustomId(`rc_team_select|${scrimId}|${roundPart}`)
    .setPlaceholder('اختر الفريق اللي هتسجل له النتيجة')
    .addOptions(
      members.map(m => ({
        label: m.name.length > 100 ? m.name.slice(0, 100) : m.name,
        value: m.id,
        description: `Team ID: ${m.id}`
      }))
    );

  const row = new ActionRowBuilder().addComponents(select);
  await interaction.reply({ content: `🔽 اختر الفريق لـ ${roundPart}`, components: [row], ephemeral: true });
  return;
}

// زرار Double Points (هنطبقه عند الضغط أو نطبّق بعد التأكيد من Total)
if (interaction.isButton() && interaction.customId.startsWith('rc_double|')) {
  // format rc_double|<scrimId>
  const [ , scrimId ] = interaction.customId.split('|');
  if (!scrimId || !scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });
  ensureResultsStructure(scrimId);
  // flip a flag in scrim results
  scrims[scrimId].doublePoints = !scrims[scrimId].doublePoints;
  saveData();
  return interaction.reply({ content: `✅ Double Points ${scrims[scrimId].doublePoints ? 'enabled' : 'disabled'} for ${scrims[scrimId].scrimTime}.`, ephemeral: true });
}

// زرار Total -> يولّد PNG ويبعته
if (interaction.isButton() && interaction.customId.startsWith('rc_total|')) {
  const [ , scrimId ] = interaction.customId.split('|');
  if (!scrimId || !scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });
  ensureResultsStructure(scrimId);

  // build aggregated stats per team
  const resultsObj = scrims[scrimId].results || {};
  const rankPoints = { 1:10, 2:6, 3:5, 4:4, 5:3, 6:2, 7:1, 8:1 };
  const teams = [];

  for (const teamId of Object.keys(resultsObj)) {
    const entry = resultsObj[teamId];
    const rounds = entry.rounds || {};
    let wwcd = 0;
    let pointsOnly = 0; // points from ranks only
    let killsTotal = 0;
    for (const rKey of ['round1','round2','round3']) {
      const r = rounds[rKey];
      if (r) {
        if (r.rank === 1) wwcd++;
        const p = (rankPoints[r.rank] || 0);
        pointsOnly += p;
        killsTotal += (r.kills || 0);
      }
    }
    const total = pointsOnly + killsTotal;
    teams.push({
      teamId,
      teamName: entry.teamName || 'Unknown',
      wwcd,
      pointsOnly,
      kills: killsTotal,
      total
    });
  }

  // sort by total desc
  teams.sort((a,b) => b.total - a.total);

  // only top 10
  const top = teams.slice(0, 10);

  // generate PNG using canvas
  try {
    // lazy-require canvas to avoid crash if not installed
    const { createCanvas, registerFont } = require('canvas');

    // optional: register a font if you have a ttf/otf file in project
    // registerFont(path.join(__dirname, 'fonts', 'YourFont.ttf'), { family: 'MyFont' });

    const width = 1000;
    const rowHeight = 48;
    const headerHeight = 140;
    const footerHeight = 30;
    const height = headerHeight + Math.max(10, top.length) * rowHeight + footerHeight;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // background: dark orange
    ctx.fillStyle = '#000000'; // dark orange
    ctx.fillRect(0,0,width,height);

    // title
    ctx.fillStyle = '#FFFFFF'; // black text
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 SCRIM RESULTS 🏆', width/2, 46);

    // scrim time line
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Scrim Time ⤳ ${scrims[scrimId].scrimTime || scrimId}`, width/2, 76);

    // separator line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 90);
    ctx.lineTo(width-40, 90);
    ctx.stroke();

    // header columns
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    const startX = 60;
    const colTeamX = 120;
    const colWWCDX = 560;
    const colPointsX = 640;
    const colKillsX = 740;
    const colTotalX = 840;

    ctx.fillText('TOP', startX, 120);
    ctx.fillText('Team', colTeamX, 120);
    ctx.fillText('WWCD', colWWCDX, 120);
    ctx.fillText('Points', colPointsX, 120);
    ctx.fillText('Kills', colKillsX, 120);
    ctx.fillText('Total', colTotalX, 120);

    // rows
    ctx.font = '16px Arial';
    for (let i = 0; i < top.length; i++) {
      const y = headerHeight + i * rowHeight;
      const t = top[i];
      const rankStr = `#${i+1}`;
      ctx.fillText(rankStr, startX, y);
      // team name truncated if too long
      const name = t.teamName.length > 36 ? t.teamName.slice(0,33) + '...' : t.teamName;
      ctx.fillText(name, colTeamX, y);
      ctx.fillText(String(t.wwcd), colWWCDX, y);
      ctx.fillText(String(t.pointsOnly), colPointsX, y);
      ctx.fillText(String(t.kills), colKillsX, y);
      ctx.fillText(String(t.total), colTotalX, y);
    }

    // bottom separator
    ctx.beginPath();
    ctx.moveTo(40, headerHeight + top.length * rowHeight + 10);
    ctx.lineTo(width-40, headerHeight + top.length * rowHeight + 10);
    ctx.stroke();

    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: `scrim_${scrimId}_results.png` });

    await interaction.reply({ files: [attachment] });
  } catch (errCanvas) {
    console.error('Canvas error:', errCanvas);
    return interaction.reply({ content: '⚠️ حدث خطأ أثناء توليد الصورة (تأكد أنك نصّبت مكتبة canvas).', flags: 64 });
  }

  return;
}


// =========================
// ✅ زرار التسجيل Register
// =========================
if (interaction.isButton() && interaction.customId.startsWith('register_')) {
  const scrimId = interaction.customId.replace('register_', '');
  if (!scrims[scrimId]) {
    return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', ephemeral: true });
  }

// ✅ التحقق لو التسجيل مقفول
  if (scrims[scrimId].registration === 'closed') {
    return interaction.reply({ content: '🚫 التسجيل مغلق حاليًا لهذا السكرم.', ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId(`modal_register_${scrimId}`)
    .setTitle(`📋 تسجيل لسكرم ${scrims[scrimId].scrimTime}`);

  const teamNameInput = new TextInputBuilder()
    .setCustomId('teamNameInput')
    .setLabel('اسم الفريق')
    .setPlaceholder('اكتب اسم فريقك هنا')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(teamNameInput));

  await interaction.showModal(modal);
  return; // ✅ مهم جدًا علشان يمنع تكملة الكود بعد المودال
}



// =========================
// ✅ أزرار قبول/رفض الفرق
// =========================
if (interaction.isButton() && interaction.customId.includes('|')) {
  const [action, scrimId, teamId] = interaction.customId.split('|');
  // keep old behaviour for accept/reject buttons
  const scrim = scrims[scrimId];
  if (!scrim) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });

  const pending = (scrim.pending || []).find(p => p.id === teamId);
  if (!pending) return interaction.reply({ content: '❌ الطلب مش موجود.', flags: 64 });

  if (action === 'accept') {
    if (!scrim.members) scrim.members = [];
    scrim.members.push(pending);
    scrim.pending = scrim.pending.filter(p => p.id !== teamId);
    saveData();
    await updateListMessage(scrimId);
    return interaction.reply({ content: `✅ تم القبول بواسطة <@${interaction.user.id}>`, flags: 64 });
  } else if (action === 'reject') {
    scrim.pending = scrim.pending.filter(p => p.id !== teamId);
    saveData();
    return interaction.reply({ content: `❌ تم الرفض بواسطة <@${interaction.user.id}>`, flags: 64 });
  }
}

// =========================
// ✅ Select Menu for Result Calculator (user chose a team)
// =========================
if (interaction.isStringSelectMenu() && interaction.customId.startsWith('rc_team_select|')) {
  // customId format: rc_team_select|<scrimId>|<round>
  const [ , scrimId, roundPart ] = interaction.customId.split('|');
  if (!scrimId || !scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });

  const teamId = interaction.values[0];
  if (!teamId) return interaction.reply({ content: '❌ لازم تختار فريق.', flags: 64 });

  ensureResultsStructure(scrimId);
  const existing = scrims[scrimId].results[teamId]?.rounds?.[roundPart] || null;

  // build modal
  const modal = new ModalBuilder()
    .setCustomId(`rc_modal|${scrimId}|${roundPart}|${teamId}`)
    .setTitle(`Result - ${roundPart} - ${scrims[scrimId].results[teamId].teamName}`);

  const rankInput = new TextInputBuilder()
    .setCustomId('rankInput')
    .setLabel('Rank (1-25)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('1')
    .setRequired(true);

  const killsInput = new TextInputBuilder()
    .setCustomId('killsInput')
    .setLabel('Kills (number)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('0')
    .setRequired(true);

  if (existing) {
    if (existing.rank !== undefined) rankInput.setValue(String(existing.rank));
    if (existing.kills !== undefined) killsInput.setValue(String(existing.kills));
  }

  modal.addComponents(
    new ActionRowBuilder().addComponents(rankInput),
    new ActionRowBuilder().addComponents(killsInput)
  );

  await interaction.showModal(modal);
  return;
}

// =========================
// ✅ مودالات (تسجيل فريق + مودالات الداشبورد + مودالات Result Calculator)
// =========================

// ✅ مودال إنشاء السكرم الجديد

if (interaction.customId === 'modal_new_scrim') {
  await interaction.deferReply({ flags: 64 });

  try {
    const scrimTime = interaction.fields.getTextInputValue('scrimTime');
    const spareTime = interaction.fields.getTextInputValue('spareTime');
    const startTime = interaction.fields.getTextInputValue('startTime');
    const mapType = interaction.fields.getTextInputValue('mapType');
    const modeInput = interaction.fields.getTextInputValue('mode')?.toLowerCase();
    const mode = modeInput === 'on' ? 'on' : 'off';

    const scrimCreate = require('./commands/scrim/scrim-create');
    const args = [scrimTime, spareTime, startTime, mapType, mode];

    await scrimCreate.execute(interaction, args, client, scrims, config, saveData);

    await interaction.editReply({ content: `✅ تم إنشاء السكرم **${scrimTime}** بنجاح!` });
  } catch (err) {
    console.error('❌ Error creating scrim:', err);
    await interaction.editReply({ content: '⚠️ حصل خطأ أثناء إنشاء السكرم.' });
  }
  return;
}


// =========================
//🚀 مودال Start a Scrim 
// =========================
if (interaction.customId === 'modal_start_scrim') {
  await interaction.deferReply({ flags: 64 });

  try {
    const scrimTime = interaction.fields.getTextInputValue('scrimTime');
    const mapName = interaction.fields.getTextInputValue('mapName');
    const roomId = interaction.fields.getTextInputValue('roomId');
    const password = interaction.fields.getTextInputValue('password');
    const startTime = interaction.fields.getTextInputValue('startTime');

    const scrimStart = require('./commands/scrim/scrim-start');
    const args = ['scrim', 'start', scrimTime, mapName, roomId, password, startTime];

    await scrimStart.execute(interaction, args, client, scrims);
    await interaction.editReply({ content: `✅ تم بدء السكرم ${scrimTime} بنجاح!` });
  } catch (err) {
    console.error('❌ Error starting scrim:', err);
    await interaction.editReply({ content: '⚠️ حصل خطأ أثناء بدء السكرم.' });
  }
  return;
}



if (interaction.type === InteractionType.ModalSubmit) {

  // تسجيل فريق جديد
  if (interaction.customId.startsWith('modal_register_')) {
    const scrimId = interaction.customId.replace('modal_register_', '');
    const teamName = interaction.fields.getTextInputValue('teamNameInput').trim();
    if (!teamName) return interaction.reply({ content: '❌ لازم تكتب اسم الفريق.', flags: 64 });
    if (!scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });

    const pending = {
      id: `team_${Date.now()}`,
      name: teamName,
      ownerId: interaction.user.id,
      ownerTag: interaction.user.tag,
      createdAt: new Date().toISOString()
    };

    if (!scrims[scrimId].pending) scrims[scrimId].pending = [];
    scrims[scrimId].pending.push(pending);
    saveData();

    if (scrims[scrimId].mode === 'on') {
      const teamRequestId = config.channels.teamRequest;
      const teamRequestChannel = await client.channels.fetch(teamRequestId).catch(() => null);
      if (!teamRequestChannel) return interaction.reply({ content: '⚠️ روم الطلبات مش متضبطة في الكونفج.', flags: 64 });

      const serverIcon = interaction.guild.iconURL({ dynamic: true, size: 64 });
      const serverName = "𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝗦𝗣𝗢𝗥𝗧𝗦";

      const embed = new EmbedBuilder()
        .setAuthor({ name: serverName, iconURL: serverIcon })
        .setTitle('📩 طلب تسجيل جديد')
        .setColor('#6f00ff')
        .addFields(
          { name: 'Team Name', value: teamName },
          { name: 'Owner', value: `<@${interaction.user.id}> (@${interaction.user.tag})` },
          { name: 'Scrim Time', value: scrims[scrimId].scrimTime },
          { name: 'Scrim ID', value: scrimId },
          { name: 'Team ID', value: pending.id },
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept|${scrimId}|${pending.id}`)
          .setLabel('✅ قبول')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject|${scrimId}|${pending.id}`)
          .setLabel('❌ رفض')
          .setStyle(ButtonStyle.Danger)
      );

      const organizerRoleId = "1416128040131362900";
      await teamRequestChannel.send({
        content: `<@&${organizerRoleId}> 📢 فيه طلب تسجيل جديد!`,
        embeds: [embed],
        components: [row]
      });

      return interaction.reply({ content: '✅ تم إرسال طلبك للإدارة للمراجعة.', flags: 64 });
    }

    // Auto accept
    if (!scrims[scrimId].members) scrims[scrimId].members = [];
    scrims[scrimId].members.push(pending);
    scrims[scrimId].pending = scrims[scrimId].pending.filter(p => p.id !== pending.id);
    saveData();
    await updateListMessage(scrimId);
    return interaction.reply({ content: '✅ تم التسجيل بنجاح (Auto Accept).', flags: 64 });
  }

// =========================
// ✅ EMBED MODAL HANDLER - معدّل ومصلّح مع الـ debugging
// =========================
if (interaction.isModalSubmit() && interaction.customId.startsWith('embed_modal_')) {
  console.log(`[EMBED HANDLER] === DEBUG START ===`);
  console.log(`[EMBED] CustomId: ${interaction.customId}`);

  try {
    // استيراد الموديول
    const embedModule = require('./commands/admin/embed');
    
    // 🔥 **DEBUG 1: شوف كل الـ embeds الموجودة في الذاكرة**
    console.log(`[EMBED DEBUG] All active embeds:`, 
      Array.from(embedModule.activeEmbeds.keys()));

    // ✅ **الكود المصحّح لاستخراج embedId و action**
    const parts = interaction.customId.split('_');
    
    let embedId = '';
    let action = '';
    let foundEdit = false;
    const embedIdParts = [];
    
    for (let i = 2; i < parts.length; i++) {
        if (parts[i] === 'edit') {
            foundEdit = true;
            // كل ما بعد "edit" هو جزء من الـ action
            action = parts.slice(i).join('_'); // 'edit_description'
            break;
        }
        embedIdParts.push(parts[i]);
    }
    
    embedId = embedIdParts.join('_');
    
    // إذا مش لاقي "edit"، يبقى فيه مشكلة
    if (!foundEdit) {
        console.log(`[EMBED ERROR] Could not find "edit" in customId`);
        // جرب طريقة بديلة
        const lastTwo = parts.slice(-2).join('_');
        if (lastTwo.startsWith('edit_')) {
            action = lastTwo;
            embedId = parts.slice(2, -2).join('_');
        }
    }

    console.log(`[EMBED] EmbedId: ${embedId}`);
    console.log(`[EMBED] Action: ${action}`);

    // 🔥 **DEBUG 2: شوف بيانات الـ embed المحدد**
    const testData = embedModule.activeEmbeds.get(embedId);
    console.log(`[EMBED DEBUG] Current embed data:`, 
      JSON.stringify(testData?.embed?.data || {}, null, 2));
    
    if (testData) {
      console.log(`[EMBED DEBUG] Message ID: ${testData.messageId}`);
      console.log(`[EMBED DEBUG] Channel ID: ${testData.channelId}`);
      console.log(`[EMBED DEBUG] Author ID: ${testData.authorId}`);
      console.log(`[EMBED DEBUG] Has components: ${!!testData.components}`);
    } else {
      console.log(`[EMBED DEBUG] No testData found for embedId: ${embedId}`);
    }

    // جلب بيانات الـ embed للاستخدام
    const embedData = embedModule.activeEmbeds.get(embedId);
    if (!embedData) {
      console.log(`[EMBED ERROR] Embed data not found!`);
      return interaction.reply({
        content: '❌ الـ Embed انتهى أو مش موجود في الذاكرة.',
        flags: 64
      });
    }

    console.log(`[EMBED] Found embed data`);

    // 🔥 **نسخ الـ embed**
    let currentEmbed;
    if (embedData.embed instanceof EmbedBuilder) {
      currentEmbed = EmbedBuilder.from(embedData.embed);
      console.log(`[EMBED] embedData.embed is already EmbedBuilder`);
    } else {
      currentEmbed = new EmbedBuilder(embedData.embed);
      console.log(`[EMBED] Converted to EmbedBuilder`);
    }

    // 🔥 **قبل التعديل**
    console.log(`[EMBED DEBUG] BEFORE edit:`, 
      JSON.stringify(currentEmbed.data, null, 2));

    // =========================
    // Handle edits
    // =========================
    if (action === 'edit_title') {
      const newTitle = interaction.fields.getTextInputValue('input_value');
      console.log(`[EMBED] Field value: "${newTitle}"`);
      currentEmbed.setTitle(newTitle);
    }
    else if (action === 'edit_description') {
      const newDesc = interaction.fields.getTextInputValue('input_value');
      console.log(`[EMBED] Field value: "${newDesc}"`);
      currentEmbed.setDescription(newDesc);
    }
    else if (action === 'edit_color') {
      const colorValue = interaction.fields.getTextInputValue('input_value');
      console.log(`[EMBED] Field value: "${colorValue}"`);
      // حاول تحويل لون HEX أو اسم لون
      try {
        if (colorValue.startsWith('#')) {
          currentEmbed.setColor(colorValue);
        } else if (!isNaN(colorValue)) {
          currentEmbed.setColor(parseInt(colorValue));
        } else {
          currentEmbed.setColor(colorValue);
        }
      } catch (err) {
        console.log(`[EMBED] Color error, using default: ${err.message}`);
        currentEmbed.setColor('#FF9900');
      }
    }
    else if (action === 'edit_thumbnail') {
      const thumbnail = interaction.fields.getTextInputValue('input_value');
      console.log(`[EMBED] Field value: "${thumbnail}"`);
      if (thumbnail.trim()) {
        currentEmbed.setThumbnail(thumbnail);
      } else {
        currentEmbed.setThumbnail(null);
      }
    }
    else if (action === 'edit_image') {
      const image = interaction.fields.getTextInputValue('input_value');
      console.log(`[EMBED] Field value: "${image}"`);
      if (image.trim()) {
        currentEmbed.setImage(image);
      } else {
        currentEmbed.setImage(null);
      }
    }
    else if (action === 'edit_author') {
      const name = interaction.fields.getTextInputValue('author_name');
      const icon = interaction.fields.getTextInputValue('author_icon');
      const url = interaction.fields.getTextInputValue('author_url');
      
      console.log(`[EMBED] Author - Name: "${name}", Icon: "${icon}", URL: "${url}"`);
      
      currentEmbed.setAuthor({
        name: name || 'Unknown',
        iconURL: icon || undefined,
        url: url || undefined
      });
    }
    else if (action === 'edit_footer') {
      const text = interaction.fields.getTextInputValue('footer_text');
      const icon = interaction.fields.getTextInputValue('footer_icon');
      
      console.log(`[EMBED] Footer - Text: "${text}", Icon: "${icon}"`);
      
      currentEmbed.setFooter({
        text: text || '',
        iconURL: icon || undefined
      });
    }
    else {
      console.log(`[EMBED WARNING] Unknown action: ${action}`);
      return interaction.reply({
        content: `❌ الإجراء غير معروف: ${action}`,
        flags: 64
      });
    }

    // 🔥 **بعد التعديل**
    console.log(`[EMBED DEBUG] AFTER edit:`, 
      JSON.stringify(currentEmbed.data, null, 2));

    // =========================
    // 🔥 **حفظ التغييرات** 
    // =========================
    embedData.embed = currentEmbed;
    embedModule.activeEmbeds.set(embedId, embedData);
    
    // 🔥 **تأكد أن التغييرات اتخزنت**
    const afterSave = embedModule.activeEmbeds.get(embedId);
    console.log(`[EMBED DEBUG] AFTER save:`, 
      JSON.stringify(afterSave?.embed?.data || {}, null, 2));

    // =========================
    // تحديث الرسالة الأصلية
    // =========================
    console.log(`[EMBED] Attempting to update message ${embedData.messageId}...`);
    
    try {
      const channel = await client.channels.fetch(embedData.channelId);
      const message = await channel.messages.fetch(embedData.messageId);
      
      await message.edit({ 
        embeds: [currentEmbed],
        components: embedData.components || [] 
      });
      
      console.log(`[EMBED] Message edited successfully`);
      
      await interaction.reply({ 
        content: '✅ تم تحديث الـ Embed بنجاح!', 
        flags: 64 
      });
      
      console.log(`[EMBED HANDLER] === SUCCESS ===`);
      
    } catch (err) {
      console.error(`[EMBED ERROR] Failed to update message:`, err);
      await interaction.reply({ 
        content: '❌ فشل تحديث الرسالة. جرب مرة أخرى.', 
        flags: 64 
      });
    }

  } catch (err) {
    console.error('[EMBED ERROR]', err);
    if (!interaction.replied) {
      await interaction.reply({
        content: `⚠️ حصل خطأ: ${err.message}`,
        flags: 64
      });
    }
  }
  return;
}

  // =========================
  // ✅ معالجة مودالات إرسال الـ Embed إلى قناة
  // =========================
  if (interaction.customId.startsWith('send_embed_modal_')) {
    try {
      console.log(`[EMBED SEND] Modal received: ${interaction.customId}`);
      
      const embedId = interaction.customId.replace('send_embed_modal_', '');
      const channelInput = interaction.fields.getTextInputValue('channel_input');
      
      console.log(`[EMBED SEND] Embed ID: ${embedId}`);
      console.log(`[EMBED SEND] Channel input: ${channelInput}`);
      
      // جلب بيانات الـ embed
      const embedModule = require('./commands/admin/embed');
      const embedData = embedModule.activeEmbeds.get(embedId);
      
      if (!embedData) {
        return interaction.reply({ 
          content: '❌ الـ Embed انتهى أو مش موجود.', 
          flags: 64 
        });
      }
      
      // تحويل الـ channelInput إلى معرف القناة
      let channelId = channelInput;
      
      // إذا كانت تبدأ بـ # أو <# (mention)
      if (channelInput.startsWith('<#') && channelInput.endsWith('>')) {
        channelId = channelInput.replace(/[<#>]/g, '');
      }
      
      const targetChannel = interaction.guild.channels.cache.get(channelId);
      
      if (!targetChannel) {
        return interaction.reply({ 
          content: '❌ القناة مش موجودة! تأكد من الـ ID.', 
          flags: 64 
        });
      }
      
      // تحقق من نوع الـ embed وأعد بناءه إذا يحتاج
      let embedToSend;
      if (embedData.embed instanceof EmbedBuilder) {
        embedToSend = embedData.embed;
      } else {
        embedToSend = new EmbedBuilder(embedData.embed);
      }
      
      // إرسال الـ Embed للقناة
      await targetChannel.send({ embeds: [embedToSend] });
      
      return interaction.reply({ 
        content: `✅ تم نشر الـ Embed بنجاح في ${targetChannel}!`, 
        flags: 64 
      });
      
    } catch (error) {
      console.error('❌ Error sending embed to channel:', error);
      return interaction.reply({ 
        content: `⚠️ حدث خطأ: ${error.message}`, 
        flags: 64 
      });
    }
  }

  // =========================
  // باقي مودالات الداشبورد (حذف/انهاء/قفل/تعديل)
  // =========================
  const id = interaction.customId;
  const getScrimId = t => t.replace(/:/g, '-');

  // RESULT-CALCULATOR modal submit (customId format rc_modal|scrimId|round|teamId)
  if (id.startsWith('rc_modal|')) {
    const parts = id.split('|');
    // parts: ['rc_modal', '<scrimId>', '<roundPart>', '<teamId>']
    const scrimId = parts[1];
    const roundPart = parts[2]; // e.g., round1
    const teamId = parts[3];

    if (!scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود.', flags: 64 });
    ensureResultsStructure(scrimId);

    const rank = parseInt(interaction.fields.getTextInputValue('rankInput'), 10);
    const kills = parseInt(interaction.fields.getTextInputValue('killsInput'), 10);

    if (Number.isNaN(rank) || rank < 1 || rank > 25) return interaction.reply({ content: '❌ الرانك لازم يكون رقم من 1 إلى 25.', flags: 64 });
    if (Number.isNaN(kills) || kills < 0) return interaction.reply({ content: '❌ الكيليس لازم يكون رقم >= 0.', flags: 64 });

    // store
    if (!scrims[scrimId].results) scrims[scrimId].results = {};
    if (!scrims[scrimId].results[teamId]) scrims[scrimId].results[teamId] = { teamName: (scrims[scrimId].members.find(m => m.id === teamId) || {}).name || 'Unknown', rounds: {round1:null, round2:null, round3:null} };
    scrims[scrimId].results[teamId].rounds[roundPart] = { rank, kills };
    saveData();

    return interaction.reply({ content: `✅ تم حفظ نتيجة ${roundPart} للفريق (${scrims[scrimId].results[teamId].teamName}) - Rank: ${rank}, Kills: ${kills}`, ephemeral: true });
  }

  // existing dashboard modals (delete/end/close/toggle/edit time)
  let time = null;

  // استبعاد مودالات الـ embed والأخرى التي لا تحتوي على scrimTime
  const excludeModals = ['modal_edit_time', 'rc_modal', 'send_embed_modal', 'embed_modal'];
  const shouldGetScrimTime = !excludeModals.some(exclude => interaction.customId.startsWith(exclude));

  if (shouldGetScrimTime) {
    try {
      time = interaction.fields.getTextInputValue('scrimTime') || null;
    } catch (error) {
      console.log(`⚠️ حقل scrimTime غير موجود في المودال: ${interaction.customId}`);
    }
  }

  if (id === 'modal_delete_scrim') {
    const scrimId = getScrimId(time);
    if (!scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود.', flags: 64 });
    delete scrims[scrimId];
    saveData();
    return interaction.reply({ content: `🗑️ تم حذف السكرم ${time}.`, flags: 64 });
  }

  if (id === 'modal_end_scrim') {
    const scrimId = getScrimId(time);
    if (!scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود.', flags: 64 });
    scrims[scrimId].status = 'ended';
    saveData();
    return interaction.reply({ content: `✅ تم إنهاء السكرم ${time}.`, flags: 64 });
  }

  if (id === 'modal_close_reg') {
    const scrimId = getScrimId(time);
    if (!scrims[scrimId]) {
      return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });
    }

    // قفل التسجيل في بيانات السكرم
    scrims[scrimId].registration = 'closed';
    saveData();

    // إرسال رسالة Embed في قناة التسجيل
    const registerChannelId = config.channels.registration;
    const registerChannel = await client.channels.fetch(registerChannelId).catch(() => null);

    if (registerChannel) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: serverName, iconURL: serverIcon })
        .setTitle('التسجيل قفل 🚫')
        .setDescription(`# تم قفل التسجيل لسكريم **${time}**.\nلن يتم قبول أي تسجيلات جديدة.`)
        .setColor('#ff0000')
        .setTimestamp();
      await registerChannel.send({ embeds: [embed] });
    }

    return interaction.reply({ content: `🚫 تم قفل التسجيل لسكريم ${time}.`, flags: 64 });
  }

  if (id === 'modal_open_reg') {
    const scrimId = getScrimId(time);
    if (!scrims[scrimId]) {
      return interaction.reply({ content: '❌ السكرم مش موجود أو انتهى.', flags: 64 });
    }

    // فتح التسجيل
    scrims[scrimId].registration = 'open';
    saveData();

    // إرسال رسالة في قناة التسجيل
    const registerChannelId = config.channels.registration;
    const registerChannel = await client.channels.fetch(registerChannelId).catch(() => null);
    if (registerChannel) {
      const embed = new EmbedBuilder()
        .setTitle('✅ التسجيل مفتوح الآن!')
        .setDescription(`# تم فتح التسجيل من جديد لسكريم **${time}**.\nسارع بالتسجيل الآن 🎯`)
        .setColor('#00ff00')
        .setTimestamp();
      await registerChannel.send({ embeds: [embed] });
    }

    return interaction.reply({ content: `🟢 تم فتح التسجيل لسكريم ${time}.`, flags: 64 });
  }

  if (id === 'modal_toggle_spare') {
    const scrimId = getScrimId(time);
    if (!scrims[scrimId]) return interaction.reply({ content: '❌ السكرم مش موجود.', flags: 64 });
    scrims[scrimId].spareOpen = !scrims[scrimId].spareOpen;
    saveData();
    return interaction.reply({
      content: scrims[scrimId].spareOpen
        ? `✅ تم فتح التسجيل الاحتياطي للسكرم ${time}.`
        : `🚫 تم قفل التسجيل الاحتياطي للسكرم ${time}.`,
      flags: 64
    });
  }

  if (id === 'modal_edit_time') {
    const oldTime = interaction.fields.getTextInputValue('oldTime');
    const newTime = interaction.fields.getTextInputValue('newTime');
    const oldId = getScrimId(oldTime);
    const newId = getScrimId(newTime);
    if (!scrims[oldId]) return interaction.reply({ content: '❌ السكرم القديم مش موجود.', flags: 64 });
    scrims[newId] = scrims[oldId];
    scrims[newId].scrimTime = newTime;
    delete scrims[oldId];
    saveData();
    return interaction.reply({ content: `🕒 تم تعديل وقت السكرم من ${oldTime} إلى ${newTime}.`, flags: 64 });
  }

}

} catch (err) {
console.error('⚠️ Interaction Error:', err);
if (!interaction.replied && !interaction.deferred) {
interaction.reply({ content: '⚠️ حصل خطأ.', flags: 64 }).catch(() => {});
}
}
});

// تحديث قايمة الفرق
async function updateListMessage(scrimId) {
const scrim = scrims[scrimId];
if (!scrim || !scrim.listMessageId || !scrim.listMessageChannelId) return;

const listChannel = await client.channels.fetch(scrim.listMessageChannelId).catch(() => null);
if (!listChannel) return;

const msg = await listChannel.messages.fetch(scrim.listMessageId).catch(() => null);
if (!msg) return;

const members = scrim.members || [];
const embed = new EmbedBuilder()
.setTitle(`📋 Registered Teams (${members.length})`)
.setDescription(
members.length
? members.map(t => `• ${t.name}`).join('\n')
: 'لا يوجد فرق بعد.'
)
.setColor('#6f00ff')
.setTimestamp();

await msg.edit({ embeds: [embed] }).catch(() => {});
}

// attach config to client for easy access
client.config = require('./config.json');

// تحميل كل الأحداث من مجلد events
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const eventName = file.replace('.js','');
    const handler = require(path.join(eventsPath, file));
    // بعض الأحداث تمرر (client, ...args) وبعضها تمرر (client, guild, user)
    client.on(eventName, (...args) => handler(client, ...args));
  }
}

// 🔑 تسجيل الدخول
client.login(process.env.BOT_TOKEN);
