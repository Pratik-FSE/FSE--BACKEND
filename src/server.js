const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));

// CORS (Hostinger / production)
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients (curl, server-to-server)
      if (!origin) return cb(null, true);

      const allowlist = [
        "https://fullscreenexperiences.com",
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
      ];

      if (process.env.CORS_ORIGIN) {
        allowlist.push(process.env.CORS_ORIGIN);
      }

      return allowlist.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"));
    },
  })
);

// --- API routes under /api ---
const api = express.Router();

api.get("/hello", (_req, res) => {
  res.send("Hello from backend");
});

function readJsonFile(filename) {
  const filePath = path.join(__dirname, "..", "data", filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

api.get("/clients", (_req, res) => {
  try {
    res.json(readJsonFile("clients.json"));
  } catch {
    res.status(500).json({ error: "Failed to load clients" });
  }
});

api.get("/projects", (_req, res) => {
  try {
    res.json(readJsonFile("projects.json"));
  } catch {
    res.status(500).json({ error: "Failed to load projects" });
  }
});

// Alias for frontend naming
api.get("/portfolio", (_req, res) => {
  try {
    res.json(readJsonFile("projects.json"));
  } catch {
    res.status(500).json({ error: "Failed to load portfolio" });
  }
});

api.get("/services", (_req, res) => {
  try {
    res.json(readJsonFile("services.json"));
  } catch {
    res.status(500).json({ error: "Failed to load services" });
  }
});

app.use("/api", api);

// Serve built frontend from backend (single-port localhost/prod)
// - Primary: repo-root `dist/` (Vite build output)
// - Optional Hostinger: `public_html/`
const distDir = path.join(__dirname, "..", "..", "dist");
const publicHtmlDir = path.join(__dirname, "..", "..", "public_html");
const spaRoot = fs.existsSync(distDir)
  ? distDir
  : fs.existsSync(publicHtmlDir)
    ? publicHtmlDir
    : null;

if (spaRoot) {
  app.use(express.static(spaRoot));
  // IMPORTANT: never serve SPA index for /api/*
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(spaRoot, "index.html"));
  });
}

// Backend port (separate from Vite dev server)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
