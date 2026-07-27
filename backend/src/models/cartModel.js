const { query } = require('../config/db');

async function getOrCreateCart(userId) {
  const existing = await query('SELECT id, user_id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const { rows } = await query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING id, user_id',
    [userId]
  );
  return rows[0];
}

async function getCartWithItems(userId) {
  const cart = await getOrCreateCart(userId);

  const { rows } = await query(
    `SELECT ci.id, ci.product_id, ci.quantity,
            p.name, p.price, p.stock_quantity, p.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id ASC`,
    [cart.id]
  );

  return { id: cart.id, items: rows };
}

async function findItemOwnedByUser(itemId, userId) {
  const { rows } = await query(
    `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity
     FROM cart_items ci
     JOIN carts c ON c.id = ci.cart_id
     WHERE ci.id = $1 AND c.user_id = $2`,
    [itemId, userId]
  );
  return rows[0] || null;
}

async function addItem(cartId, productId, quantity) {
  const { rows } = await query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING id, cart_id, product_id, quantity`,
    [cartId, productId, quantity]
  );
  return rows[0];
}

async function updateItemQuantity(itemId, quantity) {
  const { rows } = await query(
    'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING id, cart_id, product_id, quantity',
    [quantity, itemId]
  );
  return rows[0] || null;
}

async function removeItem(itemId) {
  const { rowCount } = await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
  return rowCount > 0;
}

async function clearCart(cartId, client) {
  await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
}

module.exports = {
  getOrCreateCart,
  getCartWithItems,
  findItemOwnedByUser,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
