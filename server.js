// server.js (ES Module version)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname untuk ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware untuk parsing JSON dan urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder 'dist' hasil build Vite
app.use(express.static(path.join(__dirname, 'dist')));

// API untuk upload gambar
app.post('/upload', (req, res) => {
  try {
    // Di sini Anda bisa menambahkan logic upload gambar sesungguhnya
    // Untuk contoh, kita kembalikan path dummy
    res.json({
      success: true,
      path: '/foto/default.jpg',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
    });
  }
});

// Handle semua route lainnya dengan index.html (untuk SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
