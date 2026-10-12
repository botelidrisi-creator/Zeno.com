import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Ensure data folder and db.json exist with initial empty state
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(
      {
        posts: [],
        settings: {
          siteName: 'Zeno.com',
          youtubeUrl: '',
          instagramUrl: '',
          telegramUrl: '',
          adminPassword: 'admin',
        },
      },
      null,
      2
    )
  );
}

interface DatabaseStructure {
  posts: any[];
  settings: Record<string, any>;
}

function readDb(): DatabaseStructure {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { posts: [], settings: {} };
  }
}

function writeDb(data: DatabaseStructure) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// API Routes
app.get('/api/posts', (_req, res) => {
  const db = readDb();
  res.json(db.posts || []);
});

app.post('/api/posts', (req, res) => {
  const db = readDb();
  const newPost = req.body;
  db.posts = [newPost, ...(db.posts || [])];
  writeDb(db);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updatedPost = req.body;
  db.posts = (db.posts || []).map((p: any) => (p.id === id ? updatedPost : p));
  writeDb(db);
  res.json(updatedPost);
});

app.delete('/api/posts/:id', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.posts = (db.posts || []).filter((p: any) => p.id !== id);
  writeDb(db);
  res.json({ success: true, id });
});

app.get('/api/settings', (_req, res) => {
  const db = readDb();
  res.json(db.settings || {});
});

app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const db = readDb();
  const correctPassword = db.settings?.adminPassword || 'admin';
  if (password === correctPassword) {
    res.json({ success: true, token: 'zeno_admin_token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

// Vite integration
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Zeno.com server running on http://0.0.0.0:${port}`);
});
