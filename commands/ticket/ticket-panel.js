const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "ticket-panel",
  description: "إنشاء لوحة التذاكر",
  async execute(message, args, client) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply({
        content: "❌ هذا الأمر مخصص للإدارة فقط!",
        flags: 64,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 نظام التذاكر")
      .setDescription("اضغط على الزر المناسب لفتح تذكرة جديدة")
      .addFields(
        { name: "📞 الدعم الفني", value: "لمشاكل البوت والتقنية" },
        { name: "💰 المشاكل المالية", value: "لمشاكل الدفع والحسابات" },
        { name: "🚨 البلاغات", value: "لبلاغات على الأعضاء" },
        { name: "📢 الإقتراحات", value: "لاقتراحاتك وتحسيناتك" },
      )
      .setColor("#5865F2")
      .setFooter({ text: "سيتم الرد عليك في أقرب وقت" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket_support")
        .setLabel("📞 دعم فني")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📞"),
      new ButtonBuilder()
        .setCustomId("open_ticket_financial")
        .setLabel("💰 مشاكل مالية")
        .setStyle(ButtonStyle.Success)
        .setEmoji("💰"),
      new ButtonBuilder()
        .setCustomId("open_ticket_report")
        .setLabel("🚨 بلاغات")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🚨"),
      new ButtonBuilder()
        .setCustomId("open_ticket_suggestion")
        .setLabel("📢 اقتراحات")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📢"),
    );

    await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    await message.reply({
      content: "✅ تم إنشاء لوحة التذاكر بنجاح!",
      flags: 64,
    });
  },
};
