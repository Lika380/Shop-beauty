const { query } = require('../config/db');

async function findAll() {
  const { rows } = await query('SELECT id, name FROM categories ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name }) {
  const { rows } = await query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  return rows[0];
}

module.exports = { findAll, findById, create };
