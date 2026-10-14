import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Enable CORS so deployed sites or external phones can access the shared database
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a130438d5149a2';

function writeDb(data: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write to database:', err);
  }

  // Also sync to shared cloud database in background
  try {
    fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'zeno_database',
        data: {
          posts: data.posts || [],
          settings: {
            siteName: data.settings?.siteName || 'Zeno.com',
            youtubeUrl: data.settings?.youtubeUrl || '',
            instagramUrl: data.settings?.instagramUrl || '',
            telegramUrl: data.settings?.telegramUrl || '',
          },
        },
      }),
    }).catch(() => {});
  } catch {}
}

// Security rule enforcement: ONLY authenticated admin can write to database
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const db = readDb();
  const correctPassword = db.settings?.adminPassword || 'admin';

  if (
    token === 'zeno_admin_token' ||
    token === correctPassword ||
    token === `Bearer ${correctPassword}` ||
    token === 'Bearer zeno_admin_token'
  ) {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden: Visitors can only read. Admin authentication is required to modify database.',
  });
}

// PUBLIC READ APIS: All visitors and phones can read posts and settings
app.get('/api/posts', (_req, res) => {
  const db = readDb();
  res.json(db.posts || []);
});

app.get('/api/settings', (_req, res) => {
  const db = readDb();
  const settingsCopy = { ...(db.settings || {}) };
  delete settingsCopy.adminPassword; // Never expose password to public visitors
  res.json(settingsCopy);
});

// PROTECTED WRITE APIS: Enforced at database level
app.post('/api/posts', requireAdmin, (req, res) => {
  const db = readDb();
  const newPost = req.body;
  if (!newPost || !newPost.title) {
    return res.status(400).json({ error: 'Invalid post data' });
  }
  db.posts = [newPost, ...(db.posts || [])];
  writeDb(db);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updatedPost = req.body;
  db.posts = (db.posts || []).map((p: any) => (p.id === id ? updatedPost : p));
  writeDb(db);
  res.json(updatedPost);
});

app.delete('/api/posts/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.posts = (db.posts || []).filter((p: any) => p.id !== id);
  writeDb(db);
  res.json({ success: true, id });
});

app.post('/api/settings', requireAdmin, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  const safeSettings = { ...db.settings };
  delete safeSettings.adminPassword;
  res.json(safeSettings);
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
