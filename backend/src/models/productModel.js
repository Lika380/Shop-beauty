const { query } = require('../config/db');

async function findAll({ category, search, page, limit, sort }) {
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category_id = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'ORDER BY id ASC';
  if (sort === 'price_asc') orderBy = 'ORDER BY price ASC';
  if (sort === 'price_desc') orderBy = 'ORDER BY price DESC';

  const offset = (page - 1) * limit;

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM products ${where}`, params);
  const total = countResult.rows[0].total;

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const { rows } = await query(
    `SELECT id, name, description, price, stock_quantity, category_id, image_url, created_at
     FROM products
     ${where}
     ${orderBy}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

async function findById(id) {
  const { rows } = await query(
    `SELECT id, name, description, price, stock_quantity, category_id, image_url, created_at
     FROM products WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, description, price, stock_quantity, category_id, image_url }) {
  const { rows } = await query(
    `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, description, price, stock_quantity, category_id, image_url, created_at`,
    [name, description ?? null, price, stock_quantity ?? 0, category_id ?? null, image_url ?? null]
  );
  return rows[0];
}

async function update(id, fields) {
  const columns = Object.keys(fields);
  if (columns.length === 0) {
    return findById(id);
  }

  const setClauses = columns.map((col, idx) => `${col} = $${idx + 1}`);
  const params = columns.map((col) => fields[col]);
  params.push(id);

  const { rows } = await query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${params.length}
     RETURNING id, name, description, price, stock_quantity, category_id, image_url, created_at`,
    params
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
