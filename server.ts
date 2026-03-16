import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Auth API
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Simple mock: any email/password works
    res.json({ success: true, user: { email, name: email.split('@')[0] } });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, password, name } = req.body;
    res.json({ success: true, user: { email, name } });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
