// events/autoreply-list.js
module.exports = (client) => {
  console.log('✅ نظام الردود التلقائية جاهز');
  
  // يمكنك إضافة المنطق هنا
  client.on('messageCreate', async (message) => {
    // تجاهل رسائل البوت
    if (message.author.bot) return;
    
    // يمكنك إضافة منطق الردود التلقائية هنا
  });
};