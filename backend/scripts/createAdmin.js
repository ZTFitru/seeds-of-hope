/**
 * Create or promote the first admin user.
 * Usage: node scripts/createAdmin.js <email> [password]
 * If password is omitted and user exists, user is promoted to admin and activated.
 * If password is provided and user does not exist, user is created as admin.
 */

require('dotenv').config();
const readline = require('readline');
const { sequelize, testConnection } = require('../config/database');
const { User } = require('../models');

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  const email = process.argv[2];
  let password = process.argv[3];

  if (!email) {
    console.error('Usage: node scripts/createAdmin.js <email> [password]');
    process.exit(1);
  }

  const connected = await testConnection();
  if (!connected) {
    console.error('Database connection failed.');
    process.exit(1);
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    if (user.role === 'admin' && user.isActive) {
      console.log('User is already an active admin.');
      process.exit(0);
    }
    await user.update({ role: 'admin', isActive: true });
    console.log('User promoted to admin and activated:', email);
    process.exit(0);
  }

  if (!password) {
    password = await prompt('New user - enter password: ');
    if (!password || password.length < 6) {
      console.error('Password must be at least 6 characters.');
      process.exit(1);
    }
  }

  const firstName = await prompt('First name: ') || 'Admin';
  const lastName = await prompt('Last name: ') || 'User';
  await User.create({
    email,
    password,
    firstName,
    lastName,
    role: 'admin',
    isActive: true,
  });
  console.log('Admin user created:', email);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => sequelize.close());
