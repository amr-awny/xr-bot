const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', '..', 'data', 'economy.json');

module.exports = {
  name: 'leaderboard',
  description: 'عرض لائحة الأغنى',

  async execute(message, args, client) {
    const db = JSON.parse(fs.readFileSync(file,'utf8'));
    const arr = Object.entries(db).map(([id, d]) => ({ id, bal: d.balance || 0 }));
    arr.sort((a,b)=>b.bal - a.bal);
    const top = arr.slice(0,10);
    const lines = top.map((t,i)=>`${i+1}. <@${t.id}> — ${t.bal}`);
    const embed = new EmbedBuilder().setTitle('🏆 Leaderboard').setDescription(lines.join('\n') || 'لا يوجد بعد.');
    await message.reply({ embeds: [embed] });
  }
};
