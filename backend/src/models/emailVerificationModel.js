const { query } = require('../config/db');

async function upsertCode(userId, code, expiresAt) {
  const { rows } = await query(
    `INSERT INTO email_verifications (user_id, code, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id)
     DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = NOW()
     RETURNING user_id, code, expires_at`,
    [userId, code, expiresAt]
  );
  return rows[0];
}

async function findByUserId(userId) {
  const { rows } = await query(
    'SELECT user_id, code, expires_at FROM email_verifications WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function remove(userId) {
  await query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
}

module.exports = { upsertCode, findByUserId, remove };
