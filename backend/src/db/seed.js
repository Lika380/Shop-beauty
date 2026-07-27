const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;

const CATEGORIES = ['Electronics', 'Books', 'Home & Kitchen', 'Sportswear', 'Toys', 'Beauty'];

const ADJECTIVES = [
  'Compact', 'Deluxe', 'Wireless', 'Portable', 'Classic', 'Modern', 'Eco',
  'Premium', 'Smart', 'Rugged', 'Lightweight', 'Ultra', 'Essential', 'Pro',
];

const NOUNS = [
  'Speaker', 'Backpack', 'Lamp', 'Notebook', 'Blender', 'Sneakers', 'Headphones',
  'Water Bottle', 'Board Game', 'Face Cream', 'Yoga Mat', 'Desk Organizer',
  'Coffee Mug', 'Alarm Clock', 'Bookshelf', 'Puzzle', 'Trainer', 'Charger',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  const price = 5 + Math.random() * 495;
  return price.toFixed(2);
}

async function seedUsers(client) {
  const users = [
    { email: 'admin@shop.test', password: 'admin123', role: 'admin' },
    { email: 'customer1@shop.test', password: 'customer123', role: 'customer' },
    { email: 'customer2@shop.test', password: 'customer123', role: 'customer' },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
    await client.query(
      `INSERT INTO users (email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO NOTHING`,
      [user.email, passwordHash, user.role]
    );
  }

  console.log(`Seeded ${users.length} users (admin@shop.test / admin123, customer1@shop.test / customer123, customer2@shop.test / customer123)`);
}

async function seedCategories(client) {
  const ids = [];
  for (const name of CATEGORIES) {
    const { rows } = await client.query(
      `INSERT INTO categories (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name]
    );
    ids.push(rows[0].id);
  }
  console.log(`Seeded ${ids.length} categories`);
  return ids;
}

async function seedProducts(client, categoryIds) {
  const total = 50;
  const usedNames = new Set();

  for (let i = 0; i < total; i++) {
    let name;
    do {
      name = `${randomItem(ADJECTIVES)} ${randomItem(NOUNS)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const price = randomPrice();
    const stock = i % 8 === 0 ? 0 : Math.floor(Math.random() * 200);
    const categoryId = randomItem(categoryIds);

    await client.query(
      `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        name,
        `${name} - a great addition to your collection.`,
        price,
        stock,
        categoryId,
        `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
      ]
    );
  }

  console.log(`Seeded ${total} products`);
}

async function resetData(client) {
  await client.query('TRUNCATE TABLE users, categories RESTART IDENTITY CASCADE');
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await resetData(client);
    await seedUsers(client);
    const categoryIds = await seedCategories(client);
    await seedProducts(client, categoryIds);
    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
