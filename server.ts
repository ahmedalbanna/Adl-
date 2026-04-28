import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Domain: Core
  app.get("/api/health", (req, res) => {
    res.json({ status: "luxury_active" });
  });

  // API Domain: Cases (Mock for startup)
  app.get("/api/cases/stats", (req, res) => {
    res.json({ total: 1202, active: 45, resolved: 1157 });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Adl] Luxury server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
