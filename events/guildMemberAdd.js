const { EmbedBuilder } = require('discord.js');

const path = require('path');

const fs = require('fs');

module.exports = async (client, member) => {

  try {

    const cfg = client.config;
    const guild = member.guild;
    // 1) Auto role

    const roleId = cfg.autoRoleId;

    if (roleId) {

      const role = member.guild.roles.cache.get(roleId);
      




      if (role) {

        await member.roles.add(role).catch(() => {});

      }

    }

    // 2) Welcome (embed + optional generated image)

    const welcomeChannel = cfg.welcomeChannelId ? await client.channels.fetch(cfg.welcomeChannelId).catch(() => null) : null;


    if (welcomeChannel) {

      const embed = new EmbedBuilder()

        .setTitle('𝑁𝐸𝑊 𝑀𝐸𝑀𝐵𝐸𝑅!')

.setDescription(`<@${member.id}>
<a:crownpurple:1447824261673779321> Ӿ𝗥丨𝐄-𝐒𝐩𝐨𝐫𝐭𝐬 <a:crownpurple:1447824261673779321> 

<a:1041_discord_gif_benc:1447824267931680910> | <a:n_arrow:1447824276693717107> 𝐇𝐞𝐲 user ${member} ${member.user.tag}



<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨  Ӿ𝗥丨𝐄-𝐒𝐩𝐨𝐫𝐭𝐬 <a:g_2:1447678505788903526>



<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐌𝐞𝐦𝐛𝐞𝐫 𝐈𝐝 ${member.user.id}



<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐓𝐨 𝐑𝐞𝐠 𝐈𝐧 𝐂𝐥𝐚𝐬𝐢𝐜 𝐒𝐜𝐫𝐢𝐦𝐬 𝐆𝐨 𝐓𝐨 : https://discord.com/channels/1107802400443617330/1445204970453471232 <a:n_news:1447824279021293658>



<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐓𝐨 𝐀𝐩𝐩𝐥𝐲 𝐓𝐨 𝐂𝐥𝐚𝐧 𝐆𝐨 𝐓𝐨 : https://discord.com/channels/1107802400443617330/1445204623043596409 <a:n_news:1447824279021293658>



<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐓𝐨 𝐀𝐩𝐩𝐥𝐲 𝐓𝐨 𝐒𝐭𝐚𝐟𝐟 𝐆𝐨 𝐓𝐨 : https://discord.com/channels/1107802400443617330/1445204623043596409 <a:n_news:1447824279021293658>


<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐘𝐨𝐮 𝐀𝐫𝐞 𝐌𝐞𝐦𝐛𝐞𝐫 𝐍𝐮𝐦𝐛𝐞𝐫 ${guild.memberCount} <a:n_fire:1447679067196358666> 


<a:1041_discord_gif_benc:1447824267931680910> | <a:n_safety:1447824265062645790> 𝐄𝐧𝐣𝐨𝐲 <a:n_heart:1447824263087394887>
`)


        .addFields(

       //   { name: 'المستخدم', value: `${member.user.tag}`, inline: true },

         // { name: 'المجموعه', value: `${member.guild.name}`, inline: true }

        )

        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

        .setImage('https://cdn.discordapp.com/attachments/1445204464452632626/1450235829300498543/lv_0_.gif?ex=695ad95d&is=695987dd&hm=d0c52e021695b6bf7448d666def85bd775ead0fa64337473d5016afd90c42014&')

        .setTimestamp()

        .setColor('#22005E');

      // لو مفعل welcomeImage ممكن نرسل صورة مولدة — نتحقق من وجود ملف

      if (cfg.welcomeImage && cfg.welcomeImage.enabled) {

        // لو حابب تستخدم canvas ركب مكتبة canvas وضيف هنا الكود اللي يولد الصورة

        // مؤقتًا نرسل embed فقط

      }

      await welcomeChannel.send({ embeds: [embed] }).catch(() => {});

    }

    // 3) Logs: سجل دخول العضو

    const logsChannel = cfg.logsChannelId ? await client.channels.fetch(cfg.logsChannelId).catch(() => null) : null;

    if (logsChannel) {

      const log = new EmbedBuilder()

        .setTitle('👤 Member Joined')

        .setDescription(`<@${member.id}> — **${member.user.tag}**`)

        .addFields(

          { name: 'ID', value: member.id, inline: true },

          { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: true }

        )

        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

        .setColor('#00FF00')

        .setTimestamp();

      await logsChannel.send({ embeds: [log] }).catch(() => {});

    }

  } catch (err) {

    console.error('guildMemberAdd handler error:', err);

  }

};