const { query } = require('../config/db');

async function create({ email, passwordHash, role = 'customer' }) {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, email_verified, created_at`,
    [email, passwordHash, role]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function markEmailVerified(id) {
  const { rows } = await query(
    'UPDATE users SET email_verified = true WHERE id = $1 RETURNING id, email, role, email_verified, created_at',
    [id]
  );
  return rows[0] || null;
}

module.exports = { create, findByEmail, markEmailVerified };
