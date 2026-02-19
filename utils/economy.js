const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'commands', 'economy.json');

if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));

function read() {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  getUser(id) {
    const db = read();
    if (!db[id]) db[id] = { balance: 0, lastDaily: null, inventory: [] };
    return db[id];
  },
  setUser(id, data) {
    const db = read();
    db[id] = data;
    save(db);
  },
  add(id, amount) {
    const u = this.getUser(id);
    u.balance += amount;
    this.setUser(id, u);
    return u;
  },
  remove(id, amount) {
    const u = this.getUser(id);
    u.balance -= amount;
    if (u.balance < 0) u.balance = 0;
    this.setUser(id, u);
    return u;
  },
  saveAll(db) { save(db); }
};
