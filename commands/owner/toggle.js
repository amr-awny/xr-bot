const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ملف لحفظ حالة send command
const TOGGLE_FILE = path.join(__dirname, '../../data/toggleData.json');

let toggleData = {};

// تحميل البيانات من الملف
if (fs.existsSync(TOGGLE_FILE)) {
  toggleData = JSON.parse(fs.readFileSync(TOGGLE_FILE, 'utf8'));
}

function saveToggleData() {
  const dir = path.dirname(TOGGLE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOGGLE_FILE, JSON.stringify(toggleData, null, 2));
}

module.exports = {
  name: "toggle",
  description: "تشغيل/إيقاف أمر send (لأونر السيرفر فقط)",
  usage: ".toggle send on/off | .toggle status",

  async execute(message, args, client) {
    // تحقق من أونر السيرفر فقط
    if (message.author.id !== message.guild.ownerId) {
      const embed = new EmbedBuilder()
        .setColor('#6614B8')
        .setTitle('🚫 صلاحية مرفوضة')
        .setDescription('هذا الأمر مخصص **لأونر السيرفر** فقط!')
        .setFooter({ text: `أونر السيرفر: ${message.guild.owner.user.tag}` })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }

    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setTitle("⚙️ نظام تشغيل/إيقاف أمر Send")
        .setDescription(`**للأونر فقط**\n\nتحكم في صلاحية استخدام أمر \`${client.prefix}send\``)
        .setColor('#6614B8')
        .addFields(
          {
            name: "🟢 تشغيل للأدمنز",
            value: `\`${client.prefix}toggle send on\`\nيسمح لكل الأدمنز`,
            inline: true
          },
          {
            name: "🔴 إيقاف للجميع",
            value: `\`${client.prefix}toggle send off\`\nللأونر فقط`,
            inline: true
          },
          {
            name: "📊 الحالة",
            value: `\`${client.prefix}toggle status\`\nعرض حالة الأمر`,
            inline: true
          }
        )
        .setFooter({ text: `أونر السيرفر: ${message.author.tag}` })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }

    const serverId = message.guild.id;
    
    // تهيئة البيانات إذا مش موجودة
    if (!toggleData[serverId]) {
      toggleData[serverId] = {
        sendEnabled: true, // true يعني شغال للجميع
        lastToggled: null,
        toggledBy: null,
        toggledAt: null
      };
    }

    // عرض الحالة
    if (args[0].toLowerCase() === 'status') {
      const isEnabled = toggleData[serverId].sendEnabled;
      const status = isEnabled ? '🟢 **مفعل للجميع**' : '🔴 **معطل (للأونر فقط)**';
      const lastToggled = toggleData[serverId].toggledAt 
        ? `<t:${Math.floor(new Date(toggleData[serverId].toggledAt).getTime() / 1000)}:R>`
        : 'لم يتم التعديل';
      
      const embed = new EmbedBuilder()
        .setTitle("📊 حالة أمر Send")
        .setColor(isEnabled ? '#6614B8' : '#6614B8')
        .addFields(
          { name: "الحالة", value: status, inline: true },
          { name: "آخر تعديل", value: lastToggled, inline: true },
          { name: "تم بواسطة", value: `<@${toggleData[serverId].toggledBy || message.author.id}>`, inline: true }
        )
        .setFooter({ text: `السيرفر: ${message.guild.name}` })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }

    // التحكم في أمر send
    if (args[0].toLowerCase() === 'send') {
      if (!args[1]) {
        return message.reply({
          content: "❌ اكتب `on` أو `off` بعد send",
          flags: 64
        });
      }

      const action = args[1].toLowerCase();
      
      if (action === 'on') {
        toggleData[serverId].sendEnabled = true;
        toggleData[serverId].lastToggled = "مفعل للجميع";
        toggleData[serverId].toggledBy = message.author.id;
        toggleData[serverId].toggledAt = new Date().toISOString();
        saveToggleData();
        
        const embed = new EmbedBuilder()
          .setColor('#6614B8')
          .setTitle('✅ تم تفعيل أمر Send')
          .setDescription(`يمكن الآن **كل الأدمنز** استخدام \`${client.prefix}send\``)
          .addFields(
            { name: "المسموح لهم", value: "👑 الأدمنز", inline: true },
            { name: "الحالة", value: "🟢 مفعل", inline: true },
            { name: "تم بواسطة", value: `<@${message.author.id}>`, inline: true }
          )
          .setFooter({ text: `السيرفر: ${message.guild.name}` })
          .setTimestamp();
        
        return message.reply({ embeds: [embed] });
      }
      
      else if (action === 'off') {
        toggleData[serverId].sendEnabled = false;
        toggleData[serverId].lastToggled = "معطل (للأونر فقط)";
        toggleData[serverId].toggledBy = message.author.id;
        toggleData[serverId].toggledAt = new Date().toISOString();
        saveToggleData();
        
        const embed = new EmbedBuilder()
          .setColor('#6614B8')
          .setTitle('🔴 تم تعطيل أمر Send')
          .setDescription(`يمكن الآن **الأونر فقط** استخدام \`${client.prefix}send\``)
          .addFields(
            { name: "المسموح له", value: "👑 أونر السيرفر فقط", inline: true },
            { name: "الحالة", value: "🔴 معطل", inline: true },
            { name: "تم بواسطة", value: `<@${message.author.id}>`, inline: true }
          )
          .setFooter({ text: `السيرفر: ${message.guild.name}` })
          .setTimestamp();
        
        return message.reply({ embeds: [embed] });
      }
      
      else {
        return message.reply({
          content: "❌ استخدم `on` أو `off` فقط",
          flags: 64
        });
      }
    }

    return message.reply({
      content: `❌ الاستخدام: \`${client.prefix}toggle send on/off\` أو \`${client.prefix}toggle status\``,
      flags: 64
    });
  }
};

// تصدير البيانات للاستخدام في index.js
module.exports.toggleData = toggleData;