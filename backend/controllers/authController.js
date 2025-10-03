const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const TOKEN_EXP = '7d';

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // check existing email or name
    const [existing] = await db.execute(
      'SELECT user_id FROM `user` WHERE email = ? OR name = ? LIMIT 1',
      [email, name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email or username already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: TOKEN_EXP });

    const [result] = await db.execute(
      'INSERT INTO `user` (name, email, password, token) VALUES (?, ?, ?, ?)',
      [name, email, hashed, token]
    );

    return res.status(201).json({ message: 'User created', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const [rows] = await db.execute(
      'SELECT user_id, name, email, password FROM `user` WHERE email = ? OR name = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ user_id: user.user_id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXP });

    // store token in DB (optional)
    await db.execute('UPDATE `user` SET token = ? WHERE user_id = ?', [token, user.user_id]);

    return res.json({ message: 'Logged in', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };
