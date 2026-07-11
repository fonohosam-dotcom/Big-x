import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import { generalLimiter } from "./src/server/middlewares/rateLimiter";
import apiRoutes from "./src/server/routes";
import { setupCronJobs } from "./src/server/jobs/cron.ts";
import { initDb } from "./src/db/init.ts";
import { seed } from "./src/db/seed.ts";
import { activeUsersMap } from "./src/server/routes/stats.ts";

async function startServer() {
  const app = express();
  app.set('trust proxy', 1); // Trust the first proxy (e.g. Nginx, Cloud Run)
  const PORT = 3000;

  await initDb();
  await seed();

  // Start background jobs
  setupCronJobs();

  // Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(helmet({ contentSecurityPolicy: false })); // Keep false for Vite dev
  app.use(express.json());
  app.use('/api', generalLimiter);

  app.use((req, res, next) => {
    const ip = req.ip || 'unknown';
    activeUsersMap.set(ip, Date.now());
    next();
  });

  // API Routes
  app.use("/api", apiRoutes);

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
