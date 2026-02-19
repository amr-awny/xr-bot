const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  AttachmentBuilder,
} = require("discord.js");
const fs = require("fs");

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const config = require("../config.json");
    const ticketsConfig = config.tickets || {};

    // فتح التذاكر
    if (interaction.customId.startsWith("open_ticket_")) {
      const ticketType = interaction.customId.replace("open_ticket_", "");

      try {
        await interaction.deferReply({ flags: 64 });

        // التحقق من وجود تذكرة مفتوحة
        const existingTicket = interaction.guild.channels.cache.find(
          (ch) =>
            ch.name.includes(`ticket-${interaction.user.username}`) &&
            ch.type === ChannelType.GuildText,
        );

        if (existingTicket) {
          return interaction.editReply({
            content: `❌ لديك تذكرة مفتوحة بالفعل: ${existingTicket}`,
          });
        }

        // تحديد نوع التذكرة
        const types = {
          support: { name: "دعم-فني", color: "#5865F2", emoji: "📞" },
          financial: { name: "مالية", color: "#57F287", emoji: "💰" },
          report: { name: "بلاغ", color: "#ED4245", emoji: "🚨" },
          suggestion: { name: "اقتراح", color: "#FEE75C", emoji: "📢" },
        };

        const typeInfo = types[ticketType] || types.support;
        const categoryId =
          ticketsConfig.categories?.[ticketType] || "1445204033668255784";
        const staffRole = ticketsConfig.staffRole || "1445203203577876621";

        // إنشاء القناة
        const ticketNumber = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        const channelName = `ticket-${typeInfo.name}-${ticketNumber}`;

        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.EmbedLinks,
              ],
            },
            {
              id: staffRole,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.ReadMessageHistory,
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
          ],
        });

        // إرسال رسالة الترحيب
        const welcomeEmbed = new EmbedBuilder()
          .setTitle(`${typeInfo.emoji} تذكرة ${typeInfo.name}`)
          .setDescription(
            `مرحباً ${interaction.user}!\n\n**نوع التذكرة:** ${typeInfo.name}\n**رقم التذكرة:** #${ticketNumber}\n**تاريخ الفتح:** <t:${Math.floor(Date.now() / 1000)}:F>\n\nيرجى شرح مشكلتك بالتفصيل وسيقوم فريق الدعم بالرد عليك في أقرب وقت.`,
          )
          .setColor(typeInfo.color)
          .setFooter({
            text: `بواسطة ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`close_ticket_${channel.id}`)
            .setLabel("🔒 إغلاق التذكرة")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`transcript_ticket_${channel.id}`)
            .setLabel("📄 حفظ المحادثة")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`claim_ticket_${channel.id}`)
            .setLabel("👤 تولي التذكرة")
            .setStyle(ButtonStyle.Primary),
        );

        await channel.send({
          content: `${interaction.user} <@&${staffRole}>`,
          embeds: [welcomeEmbed],
          components: [buttons],
        });

        // إرسال إشعار
        const logChannelId = ticketsConfig.logChannel || "1445205108152467506";
        const logChannel = await interaction.guild.channels
          .fetch(logChannelId)
          .catch(() => null);

        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("🎫 تذكرة جديدة مفتوحة")
            .setDescription(
              `**النوع:** ${typeInfo.name}\n**بواسطة:** ${interaction.user.tag}\n**التذكرة:** ${channel}`,
            )
            .setColor(typeInfo.color)
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }

        await interaction.editReply({
          content: `✅ تم فتح تذكرتك: ${channel}`,
        });
      } catch (error) {
        console.error("Error opening ticket:", error);
        await interaction.editReply({
          content: `❌ حصل خطأ: ${error.message}`,
        });
      }
    }

    // إغلاق التذكرة
    if (interaction.customId.startsWith("close_ticket_")) {
      const channelId = interaction.customId.replace("close_ticket_", "");
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) return;

      if (!channel.name.startsWith("ticket-")) {
        return interaction.reply({
          content: "❌ هذه ليست قناة تذكرة!",
          flags: 64,
        });
      }

      const confirmEmbed = new EmbedBuilder()
        .setTitle("تأكيد الإغلاق")
        .setDescription(
          "هل أنت متأكد من إغلاق التذكرة؟\n\n**ملاحظة:** سيتم حذف القناة بعد 5 دقائق.",
        )
        .setColor("#ff0000");

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_close_${channel.id}`)
          .setLabel("✅ نعم، أغلق")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("cancel_close")
          .setLabel("❌ إلغاء")
          .setStyle(ButtonStyle.Secondary),
      );

      await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        flags: 64,
      });
    }

    // تأكيد الإغلاق
    if (interaction.customId.startsWith("confirm_close_")) {
      const channelId = interaction.customId.replace("confirm_close_", "");
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) return;

      await interaction.update({
        content: "⏳ يتم إغلاق التذكرة...",
        embeds: [],
        components: [],
      });

      // إرسال إشعار الإغلاق
      const closeEmbed = new EmbedBuilder()
        .setTitle("🔒 التذكرة مغلقة")
        .setDescription(
          `تم إغلاق التذكرة بواسطة ${interaction.user}\nسيتم حذف القناة بعد 5 دقائق.`,
        )
        .setColor("#ff0000")
        .setTimestamp();

      await channel.send({ embeds: [closeEmbed] });

      // حذف القناة بعد 5 دقائق
      setTimeout(
        async () => {
          try {
            await channel.delete();
          } catch (error) {
            console.error("Error deleting channel:", error);
          }
        },
        5 * 60 * 1000,
      );
    }

    // إلغاء الإغلاق
    if (interaction.customId === "cancel_close") {
      await interaction.update({
        content: "✅ تم إلغاء الإغلاق.",
        embeds: [],
        components: [],
      });
    }

    // تولي التذكرة
    if (interaction.customId.startsWith("claim_ticket_")) {
      const channelId = interaction.customId.replace("claim_ticket_", "");
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("👤 تولي التذكرة")
        .setDescription(`${interaction.user} تولى التذكرة وسيقوم بالرد عليها.`)
        .setColor("#00ff00")
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: "✅ توليت التذكرة بنجاح!",
        flags: 64,
      });
    }

    // حفظ المحادثة (Transcript)
    if (interaction.customId.startsWith("transcript_ticket_")) {
      await interaction.deferReply({ flags: 64 });

      const channelId = interaction.customId.replace("transcript_ticket_", "");
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) return;

      try {
        // جلب الرسائل
        const messages = await channel.messages.fetch({ limit: 100 });

        let transcript = `📄 Transcript التذكرة: ${channel.name}\n`;
        transcript += `التاريخ: ${new Date().toLocaleString()}\n`;
        transcript += "=".repeat(50) + "\n\n";

        messages.reverse().forEach((msg) => {
          const time = new Date(msg.createdTimestamp).toLocaleString();
          transcript += `[${time}] ${msg.author.tag}: ${msg.content}\n`;
          if (msg.attachments.size > 0) {
            msg.attachments.forEach((att) => {
              transcript += `📎 ملف: ${att.url}\n`;
            });
          }
        });

        // حفظ الملف
        const fs = require("fs");
        const fileName = `transcript-${channel.name}-${Date.now()}.txt`;
        fs.writeFileSync(fileName, transcript);

        // إرسال الملف
        const file = new AttachmentBuilder(fileName);

        await interaction.editReply({
          content: "✅ تم حفظ المحادثة:",
          files: [file],
        });

        // حذف الملف المؤقت
        setTimeout(() => {
          try {
            fs.unlinkSync(fileName);
          } catch (error) {
            console.error("Error deleting transcript:", error);
          }
        }, 5000);
      } catch (error) {
        console.error("Error creating transcript:", error);
        await interaction.editReply({
          content: "❌ حصل خطأ أثناء حفظ المحادثة.",
        });
      }
    }
  });
};
