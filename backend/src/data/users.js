// In-memory user store (replaces a database for this demo)
const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@library.com',
    // password: "password123"
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@library.com',
    // password: "reader456"
    password: bcrypt.hashSync('reader456', 10),
    role: 'user',
  },
];

module.exports = { users };
