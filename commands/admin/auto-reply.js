const fs = require('fs');
const path = require('path');

// مسار ملف قاعدة البيانات
const autoRepliesPath = path.join(__dirname, 'auto-replies.json');

// تحميل الردود التلقائية
function loadAutoReplies() {
  if (!fs.existsSync(autoRepliesPath)) {
    fs.writeFileSync(autoRepliesPath, JSON.stringify({ autoReplies: [] }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(autoRepliesPath, 'utf8'));
  return data.autoReplies || [];
}

// حفظ الردود التلقائية
function saveAutoReplies(replies) {
  const data = { autoReplies: replies };
  fs.writeFileSync(autoRepliesPath, JSON.stringify(data, null, 2));
}

// إضافة رد تلقائي جديد
function addAutoReply(trigger, embedData, authorId) {
  const replies = loadAutoReplies();
  
  // التحقق من عدم وجود نفس الكلمة المطلوبة
  if (replies.some(reply => reply.trigger.toLowerCase() === trigger.toLowerCase())) {
    return { success: false, message: '❌ هذه الكلمة موجودة بالفعل!' };
  }
  
  const newReply = {
    id: `auto_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    trigger: trigger,
    embed: embedData,
    createdBy: authorId,
    createdAt: new Date().toISOString(),
    usageCount: 0
  };
  
  replies.push(newReply);
  saveAutoReplies(replies);
  
  return { 
    success: true, 
    message: `✅ تم إضافة الرد التلقائي!\nالكلمة: **${trigger}**`,
    reply: newReply 
  };
}

// البحث عن رد تلقائي
function findAutoReply(trigger) {
  const replies = loadAutoReplies();
  return replies.find(reply => 
    reply.trigger.toLowerCase() === trigger.toLowerCase() ||
    reply.trigger.toLowerCase().includes(trigger.toLowerCase())
  );
}

// تحديث رد تلقائي
function updateAutoReply(replyId, newTrigger, userId) {
  const replies = loadAutoReplies();
  const replyIndex = replies.findIndex(reply => reply.id === replyId);
  
  if (replyIndex === -1) {
    return { success: false, message: '❌ الرد التلقائي غير موجود!' };
  }
  
  // التحقق من صلاحيات المستخدم
  if (replies[replyIndex].createdBy !== userId) {
    return { success: false, message: '❌ ليس لديك صلاحية تعديل هذا الرد!' };
  }
  
  // التحقق من عدم تكرار الكلمة
  if (replies.some((reply, index) => 
    index !== replyIndex && reply.trigger.toLowerCase() === newTrigger.toLowerCase()
  )) {
    return { success: false, message: '❌ هذه الكلمة موجودة بالفعل في رد آخر!' };
  }
  
  const oldTrigger = replies[replyIndex].trigger;
  replies[replyIndex].trigger = newTrigger;
  saveAutoReplies(replies);
  
  return { 
    success: true, 
    message: `✅ تم تعديل الرد التلقائي!\nمن: **${oldTrigger}**\nإلى: **${newTrigger}**` 
  };
}

// حذف رد تلقائي
function deleteAutoReply(replyId, userId) {
  const replies = loadAutoReplies();
  const replyIndex = replies.findIndex(reply => reply.id === replyId);
  
  if (replyIndex === -1) {
    return { success: false, message: '❌ الرد التلقائي غير موجود!' };
  }
  
  // التحقق من صلاحيات المستخدم
  if (replies[replyIndex].createdBy !== userId) {
    return { success: false, message: '❌ ليس لديك صلاحية حذف هذا الرد!' };
  }
  
  const deletedReply = replies.splice(replyIndex, 1)[0];
  saveAutoReplies(replies);
  
  return { 
    success: true, 
    message: `✅ تم حذف الرد التلقائي: **${deletedReply.trigger}**`,
    reply: deletedReply 
  };
}

// عرض جميع الردود التلقائية
function listAutoReplies(userId = null) {
  const replies = loadAutoReplies();
  
  if (userId) {
    return replies.filter(reply => reply.createdBy === userId);
  }
  
  return replies;
}

module.exports = {
  loadAutoReplies,
  saveAutoReplies,
  addAutoReply,
  findAutoReply,
  updateAutoReply,
  deleteAutoReply,
  listAutoReplies
};