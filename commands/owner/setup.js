const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config.json");

function saveConfig(newConfig) {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
}

let config = {};
try {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(raw);
  } else {
    console.error("⚠️ ملف config.json مش موجود في المسار:", configPath);
  }
} catch (err) {
  console.error("❌ خطأ أثناء قراءة config.json:", err);
}

module.exports = {
  name: 'setup',
  description: 'إعداد البوت (للأونر فقط)',

  async execute(message, args, client) {
    const allowedOwners = config?.owners || ['1042648956494155837', '1429871149126520853'];
    if (!allowedOwners.includes(message.author.id)) {
      return message.reply('❌ هذا الأمر مخصص فقط للأونر.');
    }

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Setup Panel")
      .setDescription(
        "اختر نوع الإعداد الذي تريد تكوينه من القائمة أدناه.\nيمكنك إعداد القنوات أو الرسائل."
      )
      .setColor("#5865F2");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("setup_menu")
      .setPlaceholder("اختر نوع الإعداد...")
      .addOptions([
        { label: "Channels", description: "تكوين قنوات البوت", value: "channels" },
        { label: "Messages", description: "تكوين رسائل البوت", value: "messages" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    const replyMessage = await message.reply({ embeds: [embed], components: [row] });

    const collector = replyMessage.createMessageComponentCollector({
      componentType: 3,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (inter) => {
      if (inter.user.id !== message.author.id) {
        return inter.reply({ content: "❌ هذا الإعداد مخصص لصاحب الأمر فقط.", ephemeral: true });
      }

      await inter.deferUpdate();
      const selected = inter.values[0];

      if (selected === "channels") {
        const channelEmbed = new EmbedBuilder()
          .setTitle("📡 Setup Channels")
          .setDescription("اختر القناة التي تريد تعديلها.")
          .setColor("#5865F2");

        const buttons1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("rules").setLabel("Rules").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("registration").setLabel("Registration").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("spare").setLabel("Spare").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("list").setLabel("List").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("blacklist").setLabel("Blacklist").setStyle(ButtonStyle.Primary)
        );

        const buttons2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("teamRequest").setLabel("Teams Request").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("logs").setLabel("Logs").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("feedback").setLabel("Feedback").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("support").setLabel("Support").setStyle(ButtonStyle.Secondary)
        );

        await inter.message.edit({ embeds: [channelEmbed], components: [buttons1, buttons2] });
      }

      if (selected === "messages") {
        const messageEmbed = new EmbedBuilder()
          .setTitle("💬 Message Variables")
          .setDescription(
            "**𝐄𝐋¹ ᴢ ᴇ ᴛ丨𝐄𝐒𝐏𝐎𝐑𝐓𝐒**\n\n" +
              "**Message Variables**\n" +
              "[time] => Show Scrim Time\n" +
              "[timeSpare] => Show Spare Time\n" +
              "[rulesChannel] => Show Rules Channel\n" +
              "[spareChannel] => Show Spare Channel\n" +
              "[chatChannel] => Show Chat Channel\n" +
              "[feedbackChannel] => Show Feedback Channel\n" +
              "[listChannel] => Show List Channel\n" +
              "[blacklistChannel] => Show Blacklist Channel"
          )
          .setColor("#5865F2");

        const msgButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("editMessages").setLabel("Edit Messages").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("addImages").setLabel("Add Images").setStyle(ButtonStyle.Secondary)
        );

        await inter.message.edit({ embeds: [messageEmbed], components: [msgButtons] });
      }
    });

    const buttonCollector = replyMessage.createMessageComponentCollector({
      componentType: 2,
      time: 5 * 60 * 1000,
    });

    buttonCollector.on("collect", async (inter) => {
      if (inter.user.id !== message.author.id) {
        return inter.reply({ content: "❌ هذا الإعداد مخصص لصاحب الأمر فقط.", ephemeral: true });
      }

      const id = inter.customId;
      const allKeys = ["rules","registration","spare","list","blacklist","teamRequest","logs","feedback","support"];

      if (allKeys.includes(id)) {
        const modal = new ModalBuilder().setCustomId(`edit_${id}`).setTitle(`تعديل قناة ${id}`);
        const input = new TextInputBuilder()
          .setCustomId("newId")
          .setLabel("اكتب ID القناة الجديد")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("123456789012345678")
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await inter.showModal(modal);
      }
    });
  },
};
