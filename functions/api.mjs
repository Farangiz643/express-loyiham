import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Vaqtinchalik kinolar bazasi
let movies = [
  { id: 1, title: 'Avatar 2' },
  { id: 2, title: 'Inception' }
];

// 1. GET / -> Login sahifasi (index.html o'rniga yoki to'g'ridan-to'g'ri)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="uz">
    <head>
        <meta charset="UTF-8">
        <title>Login</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            form { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; flex-direction: column; width: 300px; gap: 15px; }
            input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
            button { padding: 10px; background: #4f46e5; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
            button:hover { background: #4338ca; }
        </style>
    </head>
    <body>
        <form action="/login" method="POST">
            <h2>Kirish</h2>
            <input type="text" name="username" placeholder="Login (admin)" required />
            <input type="password" name="password" placeholder="Parol" required />
            <button type="submit">Kirish</button>
        </form>
    </body>
    </html>
  `);
});

// 2. POST /login -> Agar admin bo'lsa /home ga redirect
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username === 'admin') {
    res.redirect('/home');
  } else {
    res.send(`<script>alert('Login xato! Faqat admin kirishi mumkin.'); window.location.href='/';</script>`);
  }
});

// 3. GET /home -> Kinolarni boshqarish (Admin panel)
app.get('/home', (req, res) => {
  let moviesHtml = movies.map(m => `
    <li style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;">
      <span>🎬 ${m.title}</span>
      <form action="/delete/${m.id}" method="POST" style="margin:0;">
        <button type="submit" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">O'chirish</button>
      </form>
    </li>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="uz">
    <head>
        <meta charset="UTF-8">
        <title>Kinolarni boshqarish</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f9; padding: 40px; display: flex; justify-content: center; }
            .container { width: 500px; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            h2, h3 { color: #333; text-align: center; }
            form { display: flex; gap: 10px; margin-bottom: 20px; }
            input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
            button { padding: 10px 15px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #059669; }
            ul { list-style: none; padding: 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Kinolarni boshqarish</h2>
            <form action="/add" method="POST">
                <input type="text" name="title" placeholder="Kino nomini kiriting..." required />
                <button type="submit">Qo'shish</button>
            </form>
            <h3>Bazadagi kinolar:</h3>
            <ul>
                ${moviesHtml || '<p>Hozircha kinolar yoq.</p>'}
            </ul>
            <br>
            <a href="/" style="color: #4f46e5; text-decoration: none;">&larr; Chiqish</a>
        </div>
    </body>
    </html>
  `);
});

// 4. POST /add -> Kino qo'shish
app.post('/add', (req, res) => {
  const { title } = req.body;
  if (title) {
    movies.push({ id: Date.now(), title });
  }
  res.redirect('/home');
});

// 5. POST /delete/:id -> Kinoni o'chirish
app.post('/delete/:id', (req, res) => {
  const id = Number(req.params.id);
  movies = movies.filter(m => m.id !== id);
  res.redirect('/home');
});

export const handler = serverless(app);