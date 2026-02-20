const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');


async function safeReply(interaction, message, content) {
  if (interaction) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content });
    } else {
      await interaction.reply({ content, flags: 64 });
    }
  } else if (message) {
    await message.reply({ content });
  }
}



module.exports = {
  name: 'scrim-create',
  description: 'إنشاء سكرم جديد',

  async execute(interactionOrMessage, args, client, scrims = {}, config = {}, saveData) {
    try {
      // تحديد نوع الـ interaction
      const isModal = interactionOrMessage.isModalSubmit?.();
      const isSlashCommand = interactionOrMessage.isChatInputCommand?.();
      const isMessage = interactionOrMessage.author && interactionOrMessage.channel;

      let interaction = isMessage ? null : interactionOrMessage;
      let message = isMessage ? interactionOrMessage : null;

      // الحصول على البيانات
      let scrimTime, spareTime, startTime, mapType, mode;

      if (isModal) {
        // من مودال
        scrimTime = interaction.fields.getTextInputValue('scrimTime');
        spareTime = interaction.fields.getTextInputValue('spareTime');
        startTime = interaction.fields.getTextInputValue('startTime');
        mapType = parseInt(interaction.fields.getTextInputValue('mapType')) || 1;
        mode = (interaction.fields.getTextInputValue('mode')?.toLowerCase() === 'on' ? 'on' : 'auto');

        // رد على المودال
       if (!interaction.deferred && !interaction.replied) {
          await interaction.deferReply({ flags: 64 });
        }
      } 
      else if (isSlashCommand) {
        // من slash command
        scrimTime = interaction.options.getString('scrim_time');
        spareTime = interaction.options.getString('spare_time');
        startTime = interaction.options.getString('start_time');
        mapType = interaction.options.getInteger('map_type');
        mode = interaction.options.getString('mode') || 'auto';

        // defer للـ slash command
        if (!interaction.deferred) {
          await interaction.deferReply({ flags: 64 });
        }
      }
      else if (message) {
        // من أمر نصي
        scrimTime = args[0];
        spareTime = args[1];
        startTime = args[2];
        mapType = parseInt(args[3]) || 1;
        mode = args[4]?.toLowerCase() === 'on' ? 'on' : 'auto';

        if (!scrimTime || !spareTime || !startTime) {
          return message.reply('❌ الاستخدام: `!scrim create <scrim_time> <spare_time> <start_time> <map_type> [mode]`');
        }
      }
      else {
        // من معالج المودال في index.js
        scrimTime = args[0];
        spareTime = args[1];
        startTime = args[2];
        mapType = parseInt(args[3]) || 1;
        mode = args[4]?.toLowerCase() === 'on' ? 'on' : 'auto';
      }

      // تحقق من صحة البيانات
      // قبل
if (!scrimTime || !spareTime || !startTime) {
  const errorMsg = '❌ البيانات غير كاملة! تأكد من إدخال جميع الأوقات.';
  if (interaction) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMsg });
    } else {
      await interaction.reply({ content: errorMsg, flags: 64 });
    }
  } else if (message) {
    await message.reply({ content: errorMsg });
  }
  return;
}

// بعد
if (!scrimTime || !spareTime || !startTime) {
  return await safeReply(interaction, message, '❌ البيانات غير كاملة! تأكد من إدخال جميع الأوقات.');
}



      const mapRotationOptions = {
        1: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Sanhok'],
        2: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Erangel'],
        3: ['Room [1]: Erangel', 'Room [2]: Miramar', 'Room [3]: Vikendi']
      };

      const mapRotation = mapRotationOptions[mapType] || mapRotationOptions[1];
      const scrimId = scrimTime.replace(/:/g, '-');

      const scrimsPath = path.join(__dirname, '..', 'scrims.json');
      const diskScrims = fs.existsSync(scrimsPath)
        ? JSON.parse(fs.readFileSync(scrimsPath, 'utf8'))
        : {};

      if (diskScrims[scrimId]) {
  const replyContent = '❌ فيه سكريم بالفعل بنفس الوقت!';

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: replyContent });
  } else {
    await interaction.reply({ content: replyContent, flags: 64 });
  }
  return;
}


      // إنشاء السكرم
      const scrimEntry = {
        id: scrimId,
        scrimTime,
        spareTime,
        startTime,
        mapType,
        mapRotation,
        mode,
        members: [],
        pending: [],
        createdBy: {
          id: interaction?.user?.id || message?.author?.id,
          tag: interaction?.user?.tag || message?.author?.tag,
          username: interaction?.member?.displayName || interaction?.user?.username || message?.author?.username
        },
        createdAt: new Date().toISOString(),
        regMessageId: null,
        regMessageChannelId: null,
        listMessageId: null,
        listMessageChannelId: null
      };

      diskScrims[scrimId] = scrimEntry;
      scrims[scrimId] = scrimEntry;
      fs.writeFileSync(scrimsPath, JSON.stringify(diskScrims, null, 2));
      if (typeof saveData === 'function') saveData();

      // إرسال اللوجات
      const guild = interaction?.guild || message?.guild;
      const user = interaction?.user || message?.author;

      const serverName = "Ӿᴀᴛᴏʀᴀ丨𝐄-𝐒𝐩𝐨𝐫𝐭𝐬";
      const serverIcon = guild?.iconURL({ dynamic: true, size: 64 }) || null;

      const logsEmbed = new EmbedBuilder()
        .setAuthor({ name: serverName, iconURL: serverIcon })
        .setTitle('Scrim created')
        .addFields(
          { name: 'Scrim Details', value: `**Scrim Time:** ${scrimTime}\n**Spare Time:** ${spareTime}\n**Start Time:** ${startTime}` },
          { name: 'Map Rotation', value: mapRotation.join('\n') },
          { name: 'Created By', value: `User: <@${user.id}>\nUser ID: ${user.id}\nUsername: ${scrimEntry.createdBy.username}` },
          { name: 'Creation Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>` }
        )
        .setColor('#6f00ff')
        .setThumbnail(user.displayAvatarURL({ extension: 'png', size: 256 }))
        .setTimestamp();

      const logsChannelId = config?.channels?.logs || null;
      let logsChannel = null;
      if (logsChannelId && guild) {
        try { logsChannel = await client.channels.fetch(logsChannelId); } catch {}
      }

      const currentChannel = interaction?.channel || message?.channel;
      if (!logsChannel) logsChannel = currentChannel;

      if (logsChannel) {
        await logsChannel.send({ embeds: [logsEmbed] });
      }

      // إنشاء رسالة التسجيل

const scrimTimeKsa = "01:00";  // 🇸🇦 السعودية
        
        const bigDescription = [

  `# OPENING REGISTRATION`,

  ``,

  `**`,

  ``,

  `- Scrim Registration Has Opened Now.`,

  ``,

  `- KSA: **${scrimTimeKsa}** 🇸🇦 & EGY: **${spareTime}** 🇪🇬`,

  ``,

  `- Organizer: <@${scrimEntry.createdBy.id}>`,

  ``,

  `- Have Fun, 🏆 E-Sports Rooms`,

  `  Era Mir Ron`,

  ``,

  `- Mention: ||@everyone|| & ||@here||`,

  ``,

  `**`

].join('\n');

      const regEmbed = new EmbedBuilder()
        .setDescription(bigDescription)
        .setColor('#6f00ff')
        .setTimestamp();

      const registerBtn = new ButtonBuilder()
        .setCustomId(`register_${scrimId}`)
        .setLabel('Register')
        .setStyle(ButtonStyle.Success);

      const cancelBtn = new ButtonBuilder()
        .setCustomId(`cancelreg_${scrimId}`)
        .setLabel('Cancel Registration')
        .setStyle(ButtonStyle.Secondary);

      const rowReg = new ActionRowBuilder().addComponents(registerBtn, cancelBtn);

      const regChannelId = config?.channels?.registration || null;
      let regChannel = null;
      if (regChannelId && guild) {
        try { regChannel = await client.channels.fetch(regChannelId); } catch {}
      }
      if (!regChannel) regChannel = currentChannel;

      const regMessage = await regChannel.send({ content: '@everyone', embeds: [regEmbed], components: [rowReg] });

      const smallEmbed = new EmbedBuilder()
        .setTitle('Total Registered 0')
        .setDescription('Registered Teams:\n*No teams yet*')
        .setColor('#6f00ff')
        .setTimestamp();

      const listMessage = await regChannel.send({ embeds: [smallEmbed] });

      // تحديث بيانات السكرم
      diskScrims[scrimId].regMessageId = regMessage.id;
      diskScrims[scrimId].regMessageChannelId = regChannel.id;
      diskScrims[scrimId].listMessageId = listMessage.id;
      diskScrims[scrimId].listMessageChannelId = regChannel.id;

      fs.writeFileSync(scrimsPath, JSON.stringify(diskScrims, null, 2));
      if (typeof saveData === 'function') saveData();

      // إرسال رسالة النجاح
      // إرسال رسالة النجاح

const successMessage = `🟢 تم إنشاء السكرم بنجاح!\n📅 Time: **${scrimTime}**\n📍 Channel: <#${regChannel.id}>`;

if (interaction?.replied || interaction?.deferred) {
  await interaction.editReply({ content: successMessage });
} else if (interaction) {
  await interaction.reply({ content: successMessage, flags: 64 });
} else if (message) {
  await message.reply({ content: successMessage });
}


   } catch (err) {
  console.error("SCRIM ERROR >>>", err);

  const errorMessage = '❌ حصل خطأ أثناء إنشاء السكرم.';

  if (interaction) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMessage });
    } else {
      await interaction.reply({ content: errorMessage, flags: 64 });
    }
  } else if (message) {
    await message.reply({ content: errorMessage });
  }
}


  }
};
