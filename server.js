const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const users = await loadUsers();
  const existing = users.find(user => user.phone === phone);

  if (existing) {
    return res.status(409).json({ success: false, message: 'Phone number already registered.' });
  }

  users.push({ name, email, phone, password, createdAt: new Date().toISOString() });
  await saveUsers(users);

  res.json({ success: true, message: 'Signup successful.' });
});

app.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required.' });
  }

  const users = await loadUsers();
  const user = users.find(item => item.phone === phone && item.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
  }

  res.json({ success: true, name: user.name, message: 'Login successful.' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

async function loadUsers() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

app.listen(PORT, () => {
  console.log(`Macdonald's test project running at http://localhost:${PORT}`);
});
