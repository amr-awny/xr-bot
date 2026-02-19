const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrim-start')
    .setDescription('بدء سكرم وإرسال التفاصيل للفرق المقبولة')
    .addStringOption(option =>
      option.setName('scrim_time')
        .setDescription('وقت السكرم (مثال: 19:00)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('map_name')
        .setDescription('اسم الخريطة')
        .setRequired(true)
        .addChoices(
          { name: 'Erangel', value: 'erangel' },
          { name: 'Miramar', value: 'miramar' },
          { name: 'Sanhok', value: 'sanhok' }
        )
    )
    .addStringOption(option =>
      option.setName('room_id')
        .setDescription('معرف الغرفة')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('password')
        .setDescription('كلمة مرور الغرفة')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('start_time')
        .setDescription('وقت البدء (مثال: 19:15)')
        .setRequired(true)
    ),

  async execute(interaction, args, client, scrims = {}) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const scrimTime = interaction.options.getString('scrim_time');
      const mapName = interaction.options.getString('map_name');
      const roomId = interaction.options.getString('room_id');
      const password = interaction.options.getString('password');
      const startTime = interaction.options.getString('start_time');
      
      const scrimId = scrimTime.replace(/:/g, '-');

      const scrimsPath = path.join(__dirname, '..', 'scrims.json');
      if (!fs.existsSync(scrimsPath)) {
        return interaction.editReply({ content: '❌ ملف السكرمز مش موجود.' });
      }

      const data = JSON.parse(fs.readFileSync(scrimsPath, 'utf8'));
      const scrim = data[scrimId] || scrims[scrimId];
      if (!scrim) {
        return interaction.editReply({ content: `❌ السكرم ${scrimId} مش موجود.` });
      }

      scrim.status = 'started';
      data[scrimId] = scrim;
      fs.writeFileSync(scrimsPath, JSON.stringify(data, null, 2));

      const acceptedTeams = Array.isArray(scrim.members) ? scrim.members : [];
      if (acceptedTeams.length === 0) {
        return interaction.editReply({ content: '❌ مفيش فرق مقبولة لهذا السكرم.' });
      }

      const mapImages = {
        erangel: 'https://media.discordapp.net/attachments/1416129837160075274/1430849995451662398/erangel.jpg',
        miramar: 'https://media.discordapp.net/attachments/1416129837160075274/1430851702327869482/miramar.jpg',
        sanhok:  'https://media.discordapp.net/attachments/1416129837160075274/1430851701962834011/sanhok.png'
      };
      const mapImage = mapImages[mapName.toLowerCase()] || mapImages.erangel;

      const serverName = "𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝗦𝗣𝗢𝗥𝗧𝗦";
      const serverIcon = interaction.guild?.iconURL ? interaction.guild.iconURL({ dynamic: true, size: 64 }) : null;

      const embed = new EmbedBuilder()
        .setAuthor({ name: serverName, iconURL: serverIcon })
        .setTitle(`Scrim Time ⤳ ${scrimTime}`)
        .setColor('#6614B8')
        .addFields(
          { name: 'MAP', value: `\`\`\`${mapName}\`\`\``, inline: true },
          { name: 'ID',  value: `\`\`\`${roomId}\`\`\``, inline: true },
          { name: 'PASS', value: `\`\`\`${password}\`\`\``, inline: true },
          { name: 'START', value: `\`\`\`${startTime}\`\`\``, inline: true }
        )
        .setImage(mapImage)
        .setFooter({ text: '𝐄𝐋¹ ᴢ ᴇ ᴛ丨ESPORTS', iconURL: serverIcon })
        .setTimestamp();

      let sentCount = 0;
      const mentionIds = [];
      for (const team of acceptedTeams) {
        try {
          if (!team.ownerId) continue;
          const user = await client.users.fetch(team.ownerId).catch(() => null);
          if (!user) {
            console.log(`⚠️ لم أجد المستخدم ${team.ownerTag || team.ownerId}`);
            continue;
          }
          await user.send({ embeds: [embed] }).catch(() => { throw new Error('dmFailed'); });
          sentCount++;
          mentionIds.push(team.ownerId);
        } catch (err) {
          console.log(`⚠️ فشل الإرسال إلى ${team.ownerTag || team.ownerId}`);
        }
      }

      let regChannel = null;
      try {
        if (scrim.regMessageChannelId) {
          regChannel = await client.channels.fetch(scrim.regMessageChannelId).catch(() => null);
        }
      } catch {}
      if (!regChannel) regChannel = interaction.channel;

      const mentionText = mentionIds.length ? mentionIds.map(id => `<@${id}>`).join(' ') : '';

      if (regChannel) {
        try {
          await regChannel.send({
            content: mentionText || 'تم بدء السكرم!',
            embeds: [embed]
          });
        } catch (e) {
          console.error('Failed to send to registration channel:', e);
        }
      }

      await interaction.editReply({ 
        content: `✅ تم بدء السكرم بنجاح!\n📨 تم إرسال الرسالة إلى **${sentCount}** فريق.\n📍 تم إرسال الإعلان في <#${regChannel.id}>` 
      });

    } catch (err) {
      console.error('scrim-start error:', err);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ حصل خطأ أثناء بدء السكرم.' });
      } else {
        await interaction.reply({ content: '❌ حصل خطأ أثناء بدء السكرم.', ephemeral: true });
      }
    }
  }
};
