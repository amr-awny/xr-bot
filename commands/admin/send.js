const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'send',
  description: 'يبعت رسالة خاصة لشخص محدد',

  async execute(message, args, client) {
    // استيراد نظام toggle
    let toggleModule;
    try {
      toggleModule = require('./toggle'); // إذا ملف toggle في نفس المجلد
    } catch {
      try {
        toggleModule = require('../admin/toggle'); // إذا في مجلد admin
      } catch {
        toggleModule = { toggleData: {} };
      }
    }

    const serverId = message.guild.id;
    const isServerOwner = message.author.id === message.guild.ownerId;
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 🔥 **التحقق من صلاحية الأونر إذا الأمر معطل**
    if (toggleModule.toggleData[serverId]) {
      const sendEnabled = toggleModule.toggleData[serverId].sendEnabled;
      
      // إذا الأمر معطل والمستخدم مش الأونر
      if (!sendEnabled && !isServerOwner) {
        const embed = new EmbedBuilder()
          .setColor(0xFF5555)
          .setTitle('🚫 الأمر غير متاح')
          .setDescription(`أمر \`send\` معطل حالياً.\n**مسموح للأونر فقط!**`)
          .addFields(
            {
              name: "المسموح له فقط",
              value: `<@${message.guild.ownerId}> (أونر السيرفر)`,
              inline: true
            },
            {
              name: "لتفعيل الأمر",
              value: `استخدم: \`${client.prefix}toggle send on\``,
              inline: true
            }
          )
          .setFooter({ 
            text: `الأمر معطل بواسطة: ${toggleModule.toggleData[serverId].toggledBy ? `<@${toggleModule.toggleData[serverId].toggledBy}>` : 'الأونر'}` 
          })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }
    }

    // 🔥 **التحقق من صلاحية الأدمن (إذا الأمر مفعل)**
    if (!isAdmin && !isServerOwner) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ صلاحية مرفوضة')
            .setDescription('يجب أن تكون **أدمن** أو **أونر السيرفر** لاستخدام هذا الأمر.')
            .addFields(
              {
                name: "الأدمنز المسموح لهم",
                value: "👑 حاملين رتبة Administrator",
                inline: true
              },
              {
                name: "للأونر فقط",
                value: `استخدم \`${client.prefix}toggle send off\``,
                inline: true
              }
            )
            .setFooter({ text: message.guild.name })
            .setTimestamp()
        ]
      });
    }

    // باقي كود send الأصلي
    const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!user) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF9900)
            .setTitle('❌ منشن الشخص')
            .setDescription(`مثال: \`${client.prefix}send @user الرسالة\``)
            .setFooter({ text: 'يجب منشن الشخص أولاً' })
        ]
      });
    }

    const msg = args.slice(1).join(' ');
    if (!msg) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF9900)
            .setTitle('❌ اكتب الرسالة')
            .setDescription(`مثال: \`${client.prefix}send @user الرسالة\``)
            .setFooter({ text: 'يجب كتابة الرسالة' })
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Message from ${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setDescription(msg)
      .setColor(0x2f3136)
      .setFooter({
        text: `Sent by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      
      const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ تم الإرسال بنجاح')
        .setDescription(`تم إرسال الرسالة إلى **${user.tag}**`)
        .addFields(
          { name: "المستلم", value: `<@${user.id}>`, inline: true },
          { name: "المرسل", value: `<@${message.author.id}>`, inline: true },
          { name: "الحالة", value: "🟢 تم الإرسال", inline: true }
        )
        .setFooter({ text: `بواسطة: ${message.author.tag}` })
        .setTimestamp();
      
      await message.reply({ embeds: [successEmbed] });
      
    } catch (err) {
      console.error(err);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⚠️ فشل الإرسال')
            .setDescription('ما قدرتش أبعت له، يمكن قافل الخاص أو بلوك.')
            .addFields(
              { name: "المستخدم", value: user.tag, inline: true },
              { name: "السبب", value: "DM مغلق أو بلوك", inline: true }
            )
            .setFooter({ text: 'جرب مراسلته بطريقة أخرى' })
            .setTimestamp()
        ]
      });
    }
  },
};