const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

// تخزين الـ embeds أثناء التعديل
const activeEmbeds = new Map();

module.exports = {
  name: "embed",
  description: "إنشاء Embed متقدم تفاعلي",

  async execute(message, args, client) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply("❌ معندكش صلاحية استخدام الأمر ده!");
    }

    const embedId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[EMBED] إنشاء embed جديد بالـ ID: ${embedId}`);

    // إنشاء Embed أساسي
    const embed = new EmbedBuilder()
      .setTitle("Custom Embed Maker")
      .setDescription("اختر الخاصية اللي عايز تعدلها ↓")
      .setColor("#FF9900");

    // Select Menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`embed_menu_${embedId}`)
      .setPlaceholder("اختر الخاصية لتعديلها")
      .addOptions([
        { label: "Title", value: "edit_title" },
        { label: "Description", value: "edit_description" },
        { label: "Color", value: "edit_color" },
        { label: "Thumbnail", value: "edit_thumbnail" },
        { label: "Image", value: "edit_image" },
        { label: "Footer", value: "edit_footer" },
        { label: "Author", value: "edit_author" },
        { label: "Timestamp", value: "edit_timestamp" },
      ]);

    const rowMenu = new ActionRowBuilder().addComponents(menu);

    // أزرار النشر والإلغاء
    const rowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`send_embed_${embedId}`)
        .setLabel("📤 Send")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`auto_reply_${embedId}`)
        .setLabel("🤖 Add to Auto Reply")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`cancel_embed_${embedId}`)
        .setLabel("❌ Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    // إرسال الرسالة
    const msg = await message.reply({ 
      embeds: [embed], 
      components: [rowMenu, rowButtons] 
    });

    console.log(`[EMBED] تم إنشاء الرسالة بالـ ID: ${msg.id}`);

    // 🔥 **هذا الجزء مهم جداً** - حفظ البيانات كاملة
    activeEmbeds.set(embedId, {
      embed: embed,
      messageId: msg.id,
      authorId: message.author.id,
      originalMsg: msg,
      channelId: msg.channelId,
      guildId: msg.guildId,
      components: [rowMenu, rowButtons] // 🔥 حفظ الـ components
    });

    // Collector للـ Select Menu و الأزرار
    const collector = msg.createMessageComponentCollector({ time: 10 * 120 * 2000 });

    collector.on("collect", async (interaction) => {
      console.log(`[EMBED COLLECTOR] interaction: ${interaction.customId}`);

      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "❌ مش ليك!", ephemeral: true });

      // ===== أزرار Send و Cancel =====
      if (interaction.isButton()) {
        if (interaction.customId === `cancel_embed_${embedId}`) {
          await interaction.update({ 
            content: "❌ تم إلغاء الـ Embed", 
            embeds: [], 
            components: [] 
          });
          activeEmbeds.delete(embedId);
          collector.stop();
          return;
        } else if (interaction.customId === `send_embed_${embedId}`) {
          // مودال لطلب إدخال القناة
          const channelModal = new ModalBuilder()
            .setCustomId(`send_embed_modal_${embedId}`)
            .setTitle("إرسال الـ Embed إلى قناة");

          const channelInput = new TextInputBuilder()
            .setCustomId("channel_input")
            .setLabel("أدخل إيدي القناة أو اذكرها")
            .setPlaceholder("#قناة أو 123456789012345678")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          channelModal.addComponents(new ActionRowBuilder().addComponents(channelInput));

          await interaction.showModal(channelModal);
          return;
        }
      }

      // ===== Select Menu =====
      if (!interaction.isStringSelectMenu()) return;

      const choice = interaction.values[0];
      console.log(`[EMBED] المستخدم اختار: ${choice}`);

      // 🔥 **جلب بيانات الـ embed من activeEmbeds**
      const embedData = activeEmbeds.get(embedId);
      if (!embedData) {
        return interaction.reply({ 
          content: "❌ الـ Embed مش موجود في الذاكرة!", 
          ephemeral: true 
        });
      }

      // Timestamp مباشرة
      if (choice === "edit_timestamp") {
        embedData.embed.setTimestamp();
        
        // 🔥 **تحديث البيانات في activeEmbeds**
        activeEmbeds.set(embedId, embedData);
        
        await interaction.update({ 
          embeds: [embedData.embed],
          components: [rowMenu, rowButtons] // 🔥 الحفاظ على الأزرار
        });
        return;
      }

      // Modal للخصائص الأخرى
      if (choice === "edit_author") {
        const authorModal = new ModalBuilder()
          .setCustomId(`embed_modal_${embedId}_${choice}`)
          .setTitle("تعديل Author");

        const nameInput = new TextInputBuilder()
          .setCustomId("author_name")
          .setLabel("اسم الـ Author")
          .setPlaceholder("اكتب اسم الـ Author هنا")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const iconInput = new TextInputBuilder()
          .setCustomId("author_icon")
          .setLabel("رابط الصورة الصغيرة (اختياري)")
          .setPlaceholder("https://example.com/image.png")
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const urlInput = new TextInputBuilder()
          .setCustomId("author_url")
          .setLabel("رابط الـ Author (اختياري)")
          .setPlaceholder("https://example.com")
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        authorModal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(iconInput),
          new ActionRowBuilder().addComponents(urlInput)
        );

        console.log(`[EMBED] إرسال مودال Author: embed_modal_${embedId}_${choice}`);
        await interaction.showModal(authorModal);
      } else if (choice === "edit_footer") {
        const footerModal = new ModalBuilder()
          .setCustomId(`embed_modal_${embedId}_${choice}`)
          .setTitle("تعديل Footer");

        const textInput = new TextInputBuilder()
          .setCustomId("footer_text")
          .setLabel("نص الـ Footer")
          .setPlaceholder("اكتب نص الـ Footer هنا")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const iconInput = new TextInputBuilder()
          .setCustomId("footer_icon")
          .setLabel("رابط الصورة الصغيرة (اختياري)")
          .setPlaceholder("https://example.com/image.png")
          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        footerModal.addComponents(
          new ActionRowBuilder().addComponents(textInput),
          new ActionRowBuilder().addComponents(iconInput)
        );

        console.log(`[EMBED] إرسال مودال Footer: embed_modal_${embedId}_${choice}`);
        await interaction.showModal(footerModal);
      } else {
        const modal = new ModalBuilder()
          .setCustomId(`embed_modal_${embedId}_${choice}`)
          .setTitle("تعديل " + choice.replace("edit_", ""));

        const input = new TextInputBuilder()
          .setCustomId("input_value")
          .setLabel("اكتب القيمة الجديدة")
          .setRequired(true)
          .setStyle(choice === "edit_description" ? TextInputStyle.Paragraph : TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(input));

        console.log(`[EMBED] إرسال مودال: embed_modal_${embedId}_${choice}`);
        await interaction.showModal(modal);
      }
    });

    // عند انتهاء الوقت
    collector.on("end", () => {
      console.log(`[EMBED] انتهى collector للـ ID: ${embedId}`);
      msg.edit({ components: [] }).catch(() => {});
      setTimeout(() => {
        if (activeEmbeds.has(embedId)) {
          console.log(`[EMBED] حذف embed من الذاكرة: ${embedId}`);
          activeEmbeds.delete(embedId);
        }
      }, 3600000);
    });
  },
};

// تصدير الخريطة للاستخدام في index.js
module.exports.activeEmbeds = activeEmbeds;