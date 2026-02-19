const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ticket-setup",
  description: "إعدادات نظام التذاكر",
  async execute(message, args, client) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return message.reply({
        content: "❌ هذا الأمر مخصص للإدارة فقط!",
        flags: 64,
      });
    }

    const categories = {
      support: "1445204033668255784", // كاتيجوري الدعم
      financial: "1445204033668255784", // كاتيجوري المشاكل المالية
      report: "1445204033668255784", // كاتيجوري البلاغات
      suggestion: "1445204033668255784", // كاتيجوري الاقتراحات
    };

    const staffRole = "1445203203577876621"; // رول الدعم
    const logChannel = "1445205108152467506"; // روم اللوجات

    const embed = new EmbedBuilder()
      .setTitle("⚙️ إعدادات نظام التذاكر")
      .setDescription("تم إعداد النظام بالكامل!")
      .addFields(
        {
          name: "📁 الكاتيجوريات",
          value: "• الدعم الفني\n• المشاكل المالية\n• البلاغات\n• الاقتراحات",
          inline: true,
        },
        { name: "👥 فريق الدعم", value: `<@&${staffRole}>`, inline: true },
        { name: "📝 روم اللوجات", value: `<#${logChannel}>`, inline: true },
      )
      .setColor("#00ff00")
      .setTimestamp();

    // حفظ الإعدادات
    const fs = require("fs");
    const config = require("../../config.json");

    config.tickets = {
      categories,
      staffRole,
      logChannel,
    };

    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

    await message.reply({
      embeds: [embed],
      flags: 64,
    });
  },
};
