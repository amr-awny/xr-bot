const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = (client) => {

    // ===================================================
    // AUTO ROLE
    // ===================================================
    client.on("guildMemberAdd", async member => {
        try {
            const role = member.guild.roles.cache.get(config.autoRoleId);
            if (!role) return console.log("Auto role not found!");
            await member.roles.add(role);
        } catch (err) {
            console.error("AutoRole error:", err);
        }
    });


    // ===================================================
    // LOG FUNCTION
    // ===================================================
    function sendLog(guild, embed) {
        const channel = guild.channels.cache.get(config.logsChannelId);
        if (channel) channel.send({ embeds: [embed] });
    }


    // ===================================================
    // JOIN / LEAVE LOGS
    // ===================================================
    client.on("guildMemberAdd", member => {
        sendLog(member.guild,
            new EmbedBuilder()
                .setTitle("👤 عضو جديد")
                .setDescription(`${member.user.tag} دخل السيرفر`)
                .setThumbnail(member.user.displayAvatarURL())
                .setColor("Green")
                .setTimestamp()
        );
    });

    client.on("guildMemberRemove", member => {
        sendLog(member.guild,
            new EmbedBuilder()
                .setTitle("🚪 خروج عضو")
                .setDescription(`${member.user.tag} خرج من السيرفر`)
                .setThumbnail(member.user.displayAvatarURL())
                .setColor("Red")
                .setTimestamp()
        );
    });


    // ===================================================
    // ROLE EVENTS
    // ===================================================
    client.on("roleCreate", role => {
        sendLog(role.guild,
            new EmbedBuilder()
                .setTitle("📘 تم إنشاء رول")
                .setDescription(`اسم الرول: ${role.name}`)
                .setColor("Blue")
                .setTimestamp()
        );
    });

    client.on("roleDelete", role => {
        sendLog(role.guild,
            new EmbedBuilder()
                .setTitle("📕 تم حذف رول")
                .setDescription(`اسم الرول: ${role.name}`)
                .setColor("Red")
                .setTimestamp()
        );
    });


    // ===================================================
    // CHANNEL EVENTS
    // ===================================================
    client.on("channelCreate", channel => {
        sendLog(channel.guild,
            new EmbedBuilder()
                .setTitle("📁 تم إنشاء روم")
                .setDescription(`اسم الروم: ${channel.name}`)
                .setColor("Blue")
                .setTimestamp()
        );
    });

    client.on("channelDelete", channel => {
        sendLog(channel.guild,
            new EmbedBuilder()
                .setTitle("🗑️ تم حذف روم")
                .setDescription(`اسم الروم: ${channel.name}`)
                .setColor("Red")
                .setTimestamp()
        );
    });


    // ===================================================
    // MESSAGE DELETE / UPDATE
    // ===================================================
    client.on("messageDelete", msg => {
        if (!msg.guild || msg.author?.bot) return;

        sendLog(msg.guild,
            new EmbedBuilder()
                .setTitle("🗑️ رسالة اتحذفت")
                .setDescription(`**الكاتب:** ${msg.author.tag}\n**المحتوى:** ${msg.content || "صورة / Embed"}`)
                .setColor("Red")
                .setTimestamp()
        );
    });

    client.on("messageUpdate", (oldMsg, newMsg) => {
        if (!newMsg.guild || newMsg.author?.bot) return;

        sendLog(newMsg.guild,
            new EmbedBuilder()
                .setTitle("✏️ رسالة اتعدلت")
                .addFields(
                    { name: "قبل:", value: oldMsg.content || "مافيش" },
                    { name: "بعد:", value: newMsg.content || "مافيش" }
                )
                .setColor("Yellow")
                .setTimestamp()
        );
    });


    // ===================================================
    // BAN EVENTS
    // ===================================================
    client.on("guildBanAdd", ban => {
        sendLog(ban.guild,
            new EmbedBuilder()
                .setTitle("🔨 بان")
                .setDescription(`اتعمل بان لـ ${ban.user.tag}`)
                .setColor("Red")
                .setTimestamp()
        );
    });

    client.on("guildBanRemove", ban => {
        sendLog(ban.guild,
            new EmbedBuilder()
                .setTitle("♻️ بان اترفعت")
                .setDescription(`اترَفع البان عن ${ban.user.tag}`)
                .setColor("Green")
                .setTimestamp()
        );
    });


    // ===================================================
    // WELCOME MESSAGE
    // ===================================================
    client.on("guildMemberAdd", member => {
        const ch = member.guild.channels.cache.get(config.welcomeChannelId);
        if (!ch) return;

        const embed = new EmbedBuilder()
            .setTitle("🎉 أهلاً بيك!")
            .setDescription(`نورت السيرفر يا ${member}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .setColor("Gold")
            .setTimestamp();

        ch.send({ embeds: [embed] });
    });

};
