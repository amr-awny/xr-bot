const { REST, Routes } = require("discord.js");

const fs = require("fs");

const path = require("path");

require("dotenv").config();

const commands = [];

function loadCommandsRecursive(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommandsRecursive(filePath);
    } else if (file.endsWith(".js")) {
      const command = require(path.resolve(filePath));

      if (command.data) {
        try {
          commands.push(command.data.toJSON());
          console.log(`✅ Loaded: ${command.data.name}`);
        } catch (error) {
          console.error(
            `❌ Error loading ${command.data.name}: ${error.message}`,
          );
        }
      }
    }
  }
}

loadCommandsRecursive("commands");

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const clientId = "1447802692335308946";

(async () => {
  try {
    console.log(`⏳ مسح كل الأوامر القديمة من كل السيرفرات...`);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] },
    );

    console.log(`⏳ جاري تسجيل ${commands.length} أمر Slash في كل السيرفرات...`);

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log("✅ تم تسجيل جميع أوامر Slash Commands في كل السيرفرات بنجاح!");
    console.log("⚠️ ملحوظة: الأوامر Global ممكن تاخد لحد ساعة عشان تظهر في كل السيرفرات.");
  } catch (error) {
    console.error("❌ خطأ في تسجيل الأوامر:", error);
  }
})();
