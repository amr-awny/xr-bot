const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const scrimsFile = path.join(__dirname, "../scrims.json");
const configFile = path.join(__dirname, "../config.json");

module.exports = async (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() && interaction.type !== InteractionType.ModalSubmit) return;

    let scrims = fs.existsSync(scrimsFile)
      ? JSON.parse(fs.readFileSync(scrimsFile))
      : {};
    const config = fs.existsSync(configFile)
      ? JSON.parse(fs.readFileSync(configFile))
      : { channels: {} };

    // 🟢 فتح المودال للتسجيل
    if (interaction.isButton() && interaction.customId.startsWith("register_")) {
      const scrimId = interaction.customId.replace("register_", "");
      const scrim = scrims[scrimId];

      if (!scrim)
        return interaction.reply({ content: "❌ السكرم مش متاح حالياً.", ephemeral: true });

      const modal = new ModalBuilder()
        .setCustomId(`modal_register_${scrimId}`)
        .setTitle("Register Your Team");

      const teamNameInput = new TextInputBuilder()
        .setCustomId("team_name")
        .setLabel("Team Name")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(50)
        .setRequired(true)
        .setPlaceholder("اكتب اسم فريقك هنا");
000000000000000000000000000000000000000000000000000000000000000000000000000000000
      modal.addComponents(new ActionRowBuilder().addComponents(teamNameInput));
      return interaction.showModal(modal);
    }

    // 🟣 عند إرسال المودال
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith("modal_register_")) {
      const scrimId = interaction.customId.replace("modal_register_", "");
      const scrim = scrims[scrimId];
      const logsChannel = await client.channels.fetch(config.channels.logs).catch(() => null);
      const listChannel = await client.channels.fetch(config.channels.registration).catch(() => null);

      if (!scrim)
        return interaction.reply({ content: "❌ السكرم انتهى أو غير متاح.", ephemeral: true });

      const teamName = interaction.fields.getTextInputValue("team_name").trim();
      if (!teamName)
        return interaction.reply({ content: "❌ لازم تكتب اسم الفريق.", ephemeral: true });

      const team = {
        id: `team_${Date.now()}`,
        name: teamName,
        ownerId: interaction.user.id,
        ownerTag: interaction.user.tag,
        registeredAt: new Date().toISOString(),
      };

      // ✅ لو Auto Accept
      if (scrim.mode !== "on" || scrim.autoAccept) {
        if (!scrim.members) scrim.members = [];
        scrim.members.push(team);
        fs.writeFileSync(scrimsFile, JSON.stringify(scrims, null, 2));

        await updateList(listChannel, scrim);
        if (logsChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle("✅ Team Auto-Registered")
            .setDescription(`**Team:** ${teamName}\n**Scrim:** ${scrim.scrimTime}`)
            .setColor("#00FF7F")
            .setFooter({ text: `By ${interaction.user.tag}` })
            .setTimestamp();
          logsChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({ content: "✅ تم تسجيل فريقك بنجاح!", ephemeral: true });
      }

      // 🟡 لو التسجيل عايز قبول يدوي
      if (!scrim.pending) scrim.pending = [];
      scrim.pending.push(team);
      fs.writeFileSync(scrimsFile, JSON.stringify(scrims, null, 2));

      const teamRequestChannel = await client.channels.fetch(config.channels.teamRequest).catch(() => null);
      if (teamRequestChannel) {
        const reqEmbed = new EmbedBuilder()
          .setTitle("📩 New Team Registration Request")
          .setDescription(
            `**Team:** ${teamName}\n**Owner:** <@${interaction.user.id}>\n**Scrim:** ${scrim.scrimTime}`
          )
          .setColor("#FFD700")
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_${scrimId}_${team.id}`)
            .setLabel("✅ Accept")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`reject_${scrimId}_${team.id}`)
            .setLabel("❌ Reject")
            .setStyle(ButtonStyle.Danger)
        );

        await teamRequestChannel.send({ embeds: [reqEmbed], components: [row] });
      }

      return interaction.reply({
        content: "✅ تم إرسال طلبك وسيتم مراجعته قريباً.",
        ephemeral: true,
      });
    }

    // 🔵 الأزرار (قبول / رفض)
    if (interaction.isButton() && (interaction.customId.startsWith("accept_") || interaction.customId.startsWith("reject_"))) {
      const [action, scrimId, teamId] = interaction.customId.split("_");
      const scrim = scrims[scrimId];
      const listChannel = await client.channels.fetch(config.channels.registration).catch(() => null);

      if (!scrim) return interaction.reply({ content: "❌ السكرم غير متاح.", ephemeral: true });

      const team = (scrim.pending || []).find((t) => t.id === teamId);
      if (!team) return interaction.reply({ content: "❌ الفريق مش موجود.", ephemeral: true });

      if (action === "accept") {
        if (!scrim.members) scrim.members = [];
        scrim.members.push(team);
        scrim.pending = scrim.pending.filter((t) => t.id !== teamId);
        fs.writeFileSync(scrimsFile, JSON.stringify(scrims, null, 2));
        await updateList(listChannel, scrim);
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("✅ Team Accepted")
              .setDescription(`تم قبول فريق **${team.name}**`)
              .setColor("#32CD32")
              .setTimestamp(),
          ],
          components: [],
        });
      } else {
        scrim.pending = scrim.pending.filter((t) => t.id !== teamId);
        fs.writeFileSync(scrimsFile, JSON.stringify(scrims, null, 2));
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Team Rejected")
              .setDescription(`تم رفض فريق **${team.name}**`)
              .setColor("#FF0000")
              .setTimestamp(),
          ],
          components: [],
        });
      }
    }
  });
};

// 🔄 تحديث قائمة الفرق
async function updateList(channel, scrim) {
  if (!channel || !scrim) return;

  const members = scrim.members || [];
  const embed = new EmbedBuilder()
    .setTitle(`📋 Registered Teams (${members.length})`)
    .setDescription(
      members.length
        ? members.map((t, i) => `${i + 1}. **${t.name}** — <@${t.ownerId}>`).join("\n")
        : "لا يوجد فرق مسجلة حالياً."
    )
    .setColor("#00BFFF")
    .setTimestamp();

  try {
    const msg = await channel.messages.fetch(scrim.listMessageId).catch(() => null);
    if (msg) await msg.edit({ embeds: [embed] });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث قائمة الفرق:", err);
  }
}
