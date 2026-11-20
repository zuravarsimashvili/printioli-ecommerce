const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'printioli_studio_secret_2026';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ლოკალური uploads საქაღალდის შექმნა ფოტოებისთვის
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer კონფიგურაცია (ფოტოების ატვირთვა კომპიუტერიდან)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, 'product-' + Date.now() + '-' + Math.round(Math.random() * 1e5) + ext);
  }
});
const upload = multer({ storage });

// SQLite ბაზასთან კავშირი
const dbPath = path.join(__dirname, 'printioli.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('SQLite შეცდომა:', err.message);
  else console.log('SQLite ბაზა დაკავშირებულია:', dbPath);
});

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

// საწყისი ლოკალური სტუდიური სურათების გენერაცია uploads/ საქაღალდეში (URL-ების გარეშე!)
function generateSeedProductArtworks() {
  const artworks = [
    {
      file: 'tee-classic.svg',
      bg: '#18181b',
      accent: '#6366f1',
      label: 'CLASSIC HEAVY TEE',
      sub: '280 GSM ORGANIC COTTON'
    },
    {
      file: 'hoodie-urban.svg',
      bg: '#1e293b',
      accent: '#f59e0b',
      label: 'URBAN OVERSIZE HOODIE',
      sub: 'PREMIUM FLEECE STUDIO'
    },
    {
      file: 'tote-studio.svg',
      bg: '#f5f0e6',
      accent: '#18181b',
      label: 'MINIMAL CANVAS TOTE',
      sub: 'HEAVY ECO FABRIC'
    },
    {
      file: 'mug-artisan.svg',
      bg: '#f1f5f9',
      accent: '#4f46e5',
      label: 'ARTISAN CERAMIC MUG',
      sub: 'MATTE STUDIO EDITION'
    },
    {
      file: 'tee-cyber.svg',
      bg: '#090d16',
      accent: '#10b981',
      label: 'CYBERPUNK GRAPHIC TEE',
      sub: 'LIMITED PRINT SERIES'
    },
    {
      file: 'hoodie-mono.svg',
      bg: '#27272a',
      accent: '#e11d48',
      label: 'MONOCHROME ZIP HOODIE',
      sub: 'ARCHITECTURAL CUT'
    }
  ];

  for (const art of artworks) {
    const filePath = path.join(uploadsDir, art.file);
    if (!fs.existsSync(filePath)) {
      const isLight = art.bg === '#f5f0e6' || art.bg === '#f1f5f9';
      const textColor = isLight ? '#18181b' : '#ffffff';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${art.bg}"/>
            <stop offset="100%" stop-color="${art.accent}" stop-opacity="0.35"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="${art.bg}"/>
        <rect width="800" height="600" fill="url(#g)"/>
        <circle cx="400" cy="255" r="135" fill="${art.accent}" fill-opacity="0.18" stroke="${art.accent}" stroke-width="3"/>
        <rect x="315" y="185" width="170" height="140" rx="22" fill="${art.accent}"/>
        <text x="400" y="268" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">PRINTIOLI</text>
        <text x="400" y="455" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="${textColor}" text-anchor="middle" letter-spacing="3">${art.label}</text>
        <text x="400" y="495" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" fill-opacity="0.7" text-anchor="middle" letter-spacing="4">${art.sub}</text>
      </svg>`;
      fs.writeFileSync(filePath, svg, 'utf8');
    }
  }
}

// SQL ცხრილებისა და რელაციური კავშირების ინიციალიზაცია
async function initDatabase() {
  generateSeedProductArtworks();
  await dbRun('PRAGMA foreign_keys = ON;');

  // 1. მომხმარებლები
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. პროდუქტები (image ინახავს ლოკალურ ფაილს /uploads/...)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      stock INTEGER DEFAULT 15,
      rating REAL DEFAULT 5.0,
      releaseDate TEXT,
      image TEXT NOT NULL
    )
  `);

  // 3. შეფასებები (1:N კავშირი products ცხრილთან)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // 4. კალათა (1:N კავშირი users და products ცხრილებთან)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      size TEXT DEFAULT 'L',
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // 5. შეკვეთები (1:N კავშირი users ცხრილთან, user_id შეიძლება იყოს NULL სტუმრის შეკვეთისას)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT,
      total_price REAL NOT NULL,
      items_summary TEXT NOT NULL,
      status TEXT DEFAULT 'დადასტურებული',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 6. შეკვეთის დეტალური პოზიციები (1:N კავშირი orders ცხრილთან)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_title TEXT NOT NULL,
      size TEXT DEFAULT 'L',
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      custom_note TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  // მთავარი ადმინისტრატორი
  const admin = await dbGet('SELECT id FROM users WHERE email = ?', ['zu.varsimashvili@gmail.com']);
  if (!admin) {
    await dbRun(
      'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Zura', 'Varsimashvili', 'zu.varsimashvili@gmail.com', 'aDMIN123', 'admin']
    );
  }

  // საწყისი პროდუქტები ლოკალური ფაილებით
  const countRow = await dbGet('SELECT COUNT(*) as cnt FROM products');
  if (countRow.cnt === 0) {
    const seedProducts = [
      ['pr-101', 'Printioli Classic Heavy Tee', '100% ორგანული 280 GSM ბამბის მაისური მაღალი სიმკვრივის სტუდიური პრინტით.', 49, 'T-Shirts', 'Printioli', 24, 5.0, '2026-02-10', '/uploads/tee-classic.svg'],
      ['pr-102', 'Urban Oversize Hoodie', 'თბილი ოვერსაიზ ჰუდი რბილი შიდა ფლისით ყოველდღიური ქუჩის სტილისთვის.', 89, 'Hoodies', 'Printioli', 14, 4.9, '2026-01-20', '/uploads/hoodie-urban.svg'],
      ['pr-103', 'Minimalist Canvas Tote', 'გამძლე ეკო-ნაჭრის ჩანთა საავტორო გრაფიკული ილუსტრაციით.', 29, 'Accessories', 'StudioCraft', 40, 4.8, '2026-03-01', '/uploads/tote-studio.svg'],
      ['pr-104', 'Artisan Ceramic Mug', 'მატე კერამიკული ჭიქა თერმომდგრადი სტუდიური ბეჭდვით.', 24, 'Accessories', 'Printioli', 32, 4.7, '2026-02-18', '/uploads/mug-artisan.svg'],
      ['pr-105', 'Cyberpunk Graphic Tee', 'ლიმიტირებული გამოშვების გრაფიკული მაისური ორმხრივი პრინტით.', 55, 'T-Shirts', 'NeoWear', 11, 5.0, '2026-03-12', '/uploads/tee-cyber.svg'],
      ['pr-106', 'Monochrome Zip Hoodie', 'არქიტექტურული ჭრის მინიმალისტური ჰუდი ლითონის ელვა-შესაკრავით.', 95, 'Hoodies', 'NeoWear', 16, 4.8, '2026-01-05', '/uploads/hoodie-mono.svg']
    ];

    for (const p of seedProducts) {
      await dbRun(
        'INSERT INTO products (id, title, description, price, category, brand, stock, rating, releaseDate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
      await dbRun(
        'INSERT INTO reviews (product_id, author_name, rating, comment) VALUES (?, ?, ?, ?)',
        [p[0], 'გიორგი ბერიძე', 5, 'იდეალური ხარისხი, ქსოვილიც და პრინტიც უმაღლეს დონეზეა!']
      );
    }
  }
}

// ==================== JWT & ADMIN MIDDLEWARES ====================

function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) req.user = decoded;
    });
  }
  next();
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'საჭიროა ავტორიზაცია' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'არავალიდური სესია' });
    req.user = decoded;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'წვდომა დაშვებულია მხოლოდ ადმინისტრატორისთვის' });
  }
  next();
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'გთხოვთ შეავსოთ ყველა ველი' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ message: 'ეს ელ.ფოსტა უკვე რეგისტრირებულია!' });
    }

    const result = await dbRun(
      'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName.trim(), lastName.trim(), cleanEmail, password, 'user']
    );

    const userObj = { id: result.lastID, firstName: firstName.trim(), lastName: lastName.trim(), email: cleanEmail, role: 'user' };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await dbGet('SELECT * FROM users WHERE email = ? AND password = ?', [cleanEmail, password]);

    if (!user) {
      return res.status(401).json({ message: 'არასწორი ელ.ფოსტა ან პაროლი' });
    }

    const userObj = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== PRODUCTS & REVIEWS ====================

app.get('/api/products', async (_req, res) => {
  try {
    const products = await dbAll(`
      SELECT p.*, COUNT(r.id) as reviewsCount
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id
      ORDER BY p.rowid DESC
    `);
    const reviews = await dbAll('SELECT * FROM reviews ORDER BY id DESC');
    res.json({ products, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = req.params.id;
    const { author_name, rating, comment } = req.body;
    if (!author_name || !rating) {
      return res.status(400).json({ message: 'შეიყვანეთ შემფასებლის სახელი და რეიტინგი' });
    }

    await dbRun(
      'INSERT INTO reviews (product_id, author_name, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, author_name.trim(), Number(rating), (comment || '').trim()]
    );

    const avgRow = await dbGet('SELECT ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE product_id = ?', [productId]);
    if (avgRow && avgRow.avgRating) {
      await dbRun('UPDATE products SET rating = ? WHERE id = ?', [avgRow.avgRating, productId]);
    }

    res.status(201).json({ message: 'შეფასება დაემატა SQL ბაზაში!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== CART & ORDERS (Guest + User) ====================

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const items = await dbAll(`
      SELECT 
        c.id as cartItemId,
        c.quantity,
        c.size,
        p.*,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) as reviewsCount
      FROM cart_items c
      INNER JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1, size = 'L' } = req.body;
    const existing = await dbGet(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.user.id, product_id, size]
    );

    if (existing) {
      await dbRun('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await dbRun(
        'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, size, quantity]
      );
    }
    res.status(201).json({ message: 'დაემატა კალათაში' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/cart/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await dbRun('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartItemId, req.user.id]);
    } else {
      await dbRun('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.cartItemId, req.user.id]);
    }
    res.json({ message: 'განახლდა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/cart/:cartItemId', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartItemId, req.user.id]);
    res.json({ message: 'წაიშალა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// შეკვეთის გაფორმება (მუშაობს როგორც ავტორიზებული, ისე სტუმარი მომხმარებლისთვის!)
app.post('/api/orders', optionalAuth, async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address, items } = req.body;
    if (!customer_name || !customer_email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'შეავსეთ სახელი, ელ.ფოსტა და დაამატეთ ნივთები კალათაში' });
    }

    const totalPrice = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
    const summary = items.map(i => `${i.title} [${i.size || 'L'}] x${i.quantity}`).join(', ');
    const userId = req.user ? req.user.id : null;

    const orderRes = await dbRun(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total_price, items_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, customer_name.trim(), customer_email.trim(), (customer_phone || '').trim(), (shipping_address || '').trim(), totalPrice, summary]
    );

    for (const item of items) {
      await dbRun(
        'INSERT INTO order_items (order_id, product_title, size, quantity, unit_price, custom_note) VALUES (?, ?, ?, ?, ?, ?)',
        [orderRes.lastID, item.title, item.size || 'L', Number(item.quantity), Number(item.price), item.customNote || null]
      );

      if (item.id && !String(item.id).startsWith('custom-')) {
        await dbRun('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', [Number(item.quantity), item.id]);
      }
    }

    if (userId) {
      await dbRun('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    }

    res.status(201).json({ message: `შეკვეთა #${orderRes.lastID} წარმატებით შეინახა SQL ბაზაში!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== ADMIN PANEL ROUTES (FILE UPLOAD + FULL CRUD) ====================

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const prod = await dbGet('SELECT COUNT(*) as count, COALESCE(SUM(stock), 0) as totalStock FROM products');
    const usr = await dbGet('SELECT COUNT(*) as count FROM users');
    const ord = await dbGet('SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM orders');
    const rev = await dbGet('SELECT COUNT(*) as count FROM reviews');
    res.json({
      productsCount: prod.count,
      totalStock: prod.totalStock,
      usersCount: usr.count,
      ordersCount: ord.count,
      revenue: ord.revenue,
      reviewsCount: rev.count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// პროდუქტის დამატება ფოტოს ატვირთვით (Multipart FormData)
app.post('/api/admin/products', authenticateToken, requireAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, price, category, brand, stock, releaseDate } = req.body;
    if (!title || !price || !category || !brand) {
      return res.status(400).json({ message: 'შეავსეთ პროდუქტის ყველა სავალდებულო ველი' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/tee-classic.svg';
    const id = 'pr-' + Date.now();

    await dbRun(
      'INSERT INTO products (id, title, description, price, category, brand, stock, rating, releaseDate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        title.trim(),
        (description || 'Printioli Studio-ს ორიგინალი ნაწარმი.').trim(),
        Number(price),
        category.trim(),
        brand.trim(),
        Number(stock) || 15,
        5.0,
        releaseDate || new Date().toISOString().split('T')[0],
        imagePath
      ]
    );

    res.status(201).json({ message: 'პროდუქტი და ატვირთული ფოტო შეინახა SQL ბაზაში!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// პროდუქტის რედაქტირება (სურვილისამებრ ახალი ფოტოს ატვირთვით)
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, upload.single('imageFile'), async (req, res) => {
  try {
    const existing = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: 'პროდუქტი ვერ მოიძებნა' });

    const { title, description, price, category, brand, stock, releaseDate } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : existing.image;

    await dbRun(
      `UPDATE products 
       SET title = ?, description = ?, price = ?, category = ?, brand = ?, stock = ?, releaseDate = ?, image = ?
       WHERE id = ?`,
      [
        title || existing.title,
        description ?? existing.description,
        Number(price || existing.price),
        category || existing.category,
        brand || existing.brand,
        Number(stock ?? existing.stock),
        releaseDate || existing.releaseDate,
        imagePath,
        req.params.id
      ]
    );

    res.json({ message: 'პროდუქტი განახლდა SQL ბაზაში!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'პროდუქტი წაიშალა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const users = await dbAll('SELECT id, firstName, lastName, email, role, created_at FROM users ORDER BY id DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbRun('UPDATE users SET role = ? WHERE id = ?', [req.body.role, req.params.id]);
    res.json({ message: 'როლი შეიცვალა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'საკუთარი ადმინ-ანგარიშის წაშლა დაუშვებელია' });
    }
    await dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'მომხმარებელი წაიშალა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ message: 'შეკვეთის სტატუსი განახლდა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/admin/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rev = await dbGet('SELECT product_id FROM reviews WHERE id = ?', [req.params.id]);
    await dbRun('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (rev) {
      const avgRow = await dbGet('SELECT ROUND(AVG(rating), 1) as avgRating FROM reviews WHERE product_id = ?', [rev.product_id]);
      await dbRun('UPDATE products SET rating = ? WHERE id = ?', [avgRow?.avgRating || 5.0, rev.product_id]);
    }
    res.json({ message: 'შეფასება წაიშალა' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Printioli SQL Backend გაშვებულია: http://localhost:${PORT}`);
  });
});