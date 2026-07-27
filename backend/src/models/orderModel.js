const { query } = require('../config/db');

async function lockCartItemsForUpdate(client, cartId) {
  const { rows } = await client.query(
    `SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity AS requested_quantity,
            p.name, p.price, p.stock_quantity
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY p.id
     FOR UPDATE OF p`,
    [cartId]
  );
  return rows;
}

async function createOrder(client, { userId, total, status = 'pending' }) {
  const { rows } = await client.query(
    `INSERT INTO orders (user_id, status, total)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, status, total, created_at`,
    [userId, status, total]
  );
  return rows[0];
}

async function createOrderItems(client, orderId, items) {
  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
       VALUES ($1, $2, $3, $4)`,
      [orderId, item.product_id, item.quantity, item.price]
    );
  }
}

async function decrementStock(client, productId, quantity) {
  await client.query(
    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
    [quantity, productId]
  );
}

async function findById(orderId) {
  const orderResult = await query(
    'SELECT id, user_id, status, total, created_at FROM orders WHERE id = $1',
    [orderId]
  );
  const order = orderResult.rows[0];
  if (!order) return null;

  const itemsResult = await query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id ASC`,
    [orderId]
  );

  return { ...order, items: itemsResult.rows };
}

async function findAll({ userId, status, page, limit }) {
  const conditions = [];
  const params = [];

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const countResult = await query(`SELECT COUNT(*)::int AS total FROM orders ${where}`, params);
  const total = countResult.rows[0].total;

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const { rows } = await query(
    `SELECT id, user_id, status, total, created_at FROM orders
     ${where}
     ORDER BY created_at DESC
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

async function updateStatus(orderId, status) {
  const { rows } = await query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, user_id, status, total, created_at',
    [status, orderId]
  );
  return rows[0] || null;
}

module.exports = {
  lockCartItemsForUpdate,
  createOrder,
  createOrderItems,
  decrementStock,
  findById,
  findAll,
  updateStatus,
};
