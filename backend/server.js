const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Replace with your deployed frontend URL for CORS
app.use(cors({
  origin: "https://mern-screen-recorder-lyart.vercel.app"
}));
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// SQLite DB
const db = new sqlite3.Database("./database.db");
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      filepath TEXT,
      filesize INTEGER,
      createdAt TEXT
    )
  `);
});

// Upload API
app.post("/api/recordings", upload.single("video"), (req, res) => {
  const { filename, path: filepath, size } = req.file;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO recordings (filename, filepath, filesize, createdAt) VALUES (?, ?, ?, ?)`,
    [filename, filepath, size, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Recording uploaded successfully",
        recording: { id: this.lastID, filename, filesize: size, createdAt },
      });
    }
  );
});

// List API
app.get("/api/recordings", (req, res) => {
  db.all(`SELECT * FROM recordings ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Change localhost to your Render backend URL
    const backendURL = "https://mern-screen-recorder-ksr.onrender.com";

    res.json(
      rows.map((r) => ({
        ...r,
        url: `${backendURL}/api/recordings/${r.id}`,
      }))
    );
  });
});

// Stream API
app.get("/api/recordings/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM recordings WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Not found" });

    const filepath = path.resolve(row.filepath);
    res.sendFile(filepath);
  });
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
