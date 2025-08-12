/*
Express server template with MySQL connection - server.js

How to use:
1. Create a new folder and put this file in it as server.js
2. Run: npm init -y
3. Install dependencies:
   npm install express helmet cors morgan dotenv mysql2
4. Start:
   node server.js

Includes:
- Environment port support (.env via dotenv)
- MySQL connection (mysql2)
- Basic security headers (helmet)
- CORS middleware
- Request logging (morgan)
- JSON body parsing
- Healthcheck and example routes
- Centralized error handling and graceful shutdown
*/

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql2/promise');

const app = express(); 

const JWT_SECRET = process.env.JWT || 'your_jwt_secret';

// Configuration
const PORT = process.env.PORT || 3000;

// MySQL connection setup
let db;
(async () => {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'secretpass',
      database: process.env.DB_NAME || 'veterinar',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
})();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: '*',         
  credentials: false     
}));

app.use(morgan('dev'));

app.use((req, res, next) => {
  req._startAt = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(req._startAt);
    const ms = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
  });
  next();
});

// Apply auth middleware conditionally
/*
app.use((req, res, next) => {
  if (req.path === '/signup' || req.path === '/login') {
    return next(); // skip auth for these routes
  }
  authenticateJWT(req, res, next);
});*/

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}



// auth routes
// Signup 
app.post('/signup', async (req, res) => {
  let active = "no";
  const { username, password, role } = req.body;
  //console.log(req.body);
  if (!username || !password || !role)
    return res.status(400).json({ error: 'Missing fields' });
  if (!['owner', 'vet', 'admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  if (role === "owner") active = "yes";

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, role, active) VALUES (?, ?, ?, ?)',
      [username, hashed, role, active]
    );

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Login - now returns JWT cookie instead of session
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing username or password' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });
    
    const active = user["active"];
    if (active != "yes")
      return res.status(401).json({ error: 'Innactive account, contant your administrator' });

    // Create JWT payload (you can add more user info if needed)
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Send token as httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true if HTTPS
      maxAge: 3600000,
      sameSite: 'lax',
    });

    // backend change
res.json({
  token
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// CRUD for owners
app.get('/owners', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM owners');
  res.json(rows);
});
app.get('/owners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM owners WHERE user_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Prevent caching to avoid stale data or 304 issues
    res.set('Cache-Control', 'no-store');

    // Return the first (and presumably only) matching owner object
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching owner:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/owners', async (req, res) => {
  //console.log(req);
  const {user_id, first_name, last_name, emso, birth_date, email, phone, address } = req.body;
  const [result] = await db.query('INSERT INTO owners (user_id, first_name, last_name, emso, birth_date, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [user_id,first_name, last_name, emso, birth_date, email, phone, address]);
  res.json({ id: result.insertId });
});
app.put('/owners/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, emso, birth_date, email, phone, address } = req.body;
  await db.query('UPDATE owners SET first_name=?, last_name=?, emso=?, birth_date=?, email=?, phone=?, address=? WHERE id=?', [first_name, last_name, emso, birth_date, email, phone, address, id]);
  res.json({ success: true });
});
app.delete('/owners/:id', async (req, res) => {
  await db.query('DELETE FROM owners WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// CRUD for animals
app.get('/animals', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM animals');
  res.json(rows);
});

app.get('/animals/user/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM animals WHERE user_id = ?',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM animals WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Prevent caching to avoid stale data
    res.set('Cache-Control', 'no-store');

    // Return single animal
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching animal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/animals', async (req, res) => {
  const { user_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight } = req.body;
  const [result] = await db.query('INSERT INTO animals (user_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [user_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight]);
  res.json({ id: result.insertId });
});
app.put('/animals/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight } = req.body;
  await db.query('UPDATE animals SET user_id=?, nickname=?, microchip_number=?, species=?, breed=?, gender=?, birth_date=?, height=?, weight=? WHERE id=?', [user_id, nickname, microchip_number, species, breed, gender, birth_date, height, weight, id]);
  res.json({ success: true });
});
app.delete('/animals/:id', async (req, res) => {
  await db.query('DELETE FROM animals WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// CRUD for vaccinations
app.get('/vaccinations', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM vaccinations');
  res.json(rows);
});

app.get('/vaccinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM vaccinations WHERE animal_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vaccination not found' });
    }

    // Prevent caching to avoid stale data
    res.set('Cache-Control', 'no-store');

    // Return single animal
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vaccine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/vaccinations', async (req, res) => {
  const { animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until } = req.body;
  const [result] = await db.query('INSERT INTO vaccinations (animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until) VALUES (?, ?, ?, ?, ?)', [animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until]);
  res.json({ id: result.insertId });
});
app.put('/vaccinations/:id', async (req, res) => {
  const { id } = req.params;
  const { animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until } = req.body;
  await db.query('UPDATE vaccinations SET animal_id=?, vaccine_type=?, vaccine_name=?, vaccination_date=?, valid_until=? WHERE id=?', [animal_id, vaccine_type, vaccine_name, vaccination_date, valid_until, id]);
  res.json({ success: true });
});
app.delete('/vaccinations/:id', async (req, res) => {
  await db.query('DELETE FROM vaccinations WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// CRUD for users
app.get('/users', async (req, res) => {
  const [rows] = await db.query('SELECT id, username, role, active FROM users');
  res.json(rows);
});
app.post('/users', async (req, res) => {
  const { username, password_hash, role } = req.body;
  const [result] = await db.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, password_hash, role]);
  res.json({ id: result.insertId });
});
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password_hash, role } = req.body;
  await db.query('UPDATE users SET username=?, password_hash=?, role=? WHERE id=?', [username, password_hash, role, id]);
  res.json({ success: true });
});
app.delete('/users/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Closing HTTP server.`);
  server.close(() => {
    console.log('HTTP server closed. Closing DB pool.');
    db.end().then(() => {
      console.log('MySQL pool closed. Exiting process.');
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error('Forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
