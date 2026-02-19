const { EmbedBuilder } = require('discord.js');
const autoReplySystem = require('../commands/admin/auto-reply');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    // تجاهل رسائل البوت
    if (message.author.bot) return;
    
    // تجاهل الأوامر (إذا كان لديك prefix)
    if (message.content.startsWith('!')) return;
    
    const content = message.content.trim().toLowerCase();
    
    // البحث عن رد تلقائي مطابق
    const autoReply = autoReplySystem.findAutoReply(content);
    
    if (autoReply) {
      try {
        // زيادة عداد الاستخدام
        const replies = autoReplySystem.loadAutoReplies();
        const replyIndex = replies.findIndex(reply => reply.id === autoReply.id);
        if (replyIndex !== -1) {
          replies[replyIndex].usageCount = (replies[replyIndex].usageCount || 0) + 1;
          autoReplySystem.saveAutoReplies(replies);
        }
        
        // إعادة بناء الـ Embed من البيانات المحفوظة
        const embed = new EmbedBuilder(autoReply.embed);
        
        // إرسال الـ Embed
        await message.channel.send({ 
          embeds: [embed] 
        });
        
      } catch (error) {
        console.error('Error sending auto reply:', error);
      }
    }
  });
};