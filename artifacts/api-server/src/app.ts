import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import router from "./routes/index";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust proxy in production (required for HTTPS/secure cookies behind reverse proxy)
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));

// Session configuration
// @ts-ignore
const PgSession = ConnectPgSimple(session);

app.use(session({
  store: new (PgSession as any)({
    pool: pool as any,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret-please-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  proxy: process.env.NODE_ENV === 'production',
}));

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Health router
app.use("/api", router);

// Register all legacy app routes (mounts at /api/v1/... etc)
registerRoutes(app);

// Serve the built React frontend when available (single-server deployments
// where Express handles all routes, e.g. Railway/pm2 or a Vercel setup that
// routes everything to this app). Requires the frontend to be built first
// (root `pnpm run build` builds both). On Replit dev, the frontend runs on
// its own Vite server, so this is a no-op fallback.
const frontendCandidates = [
  path.resolve(process.cwd(), "artifacts/seamxy/dist/public"),
  path.resolve(import.meta.dirname, "../../seamxy/dist/public"),
];
const frontendDir = frontendCandidates.find((dir) =>
  fs.existsSync(path.join(dir, "index.html")),
);

if (frontendDir) {
  logger.info({ frontendDir }, "Serving frontend static files");
  app.use(
    express.static(frontendDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          // Never let CDNs/proxies pin an old app shell; hashed assets stay cacheable
          res.setHeader("Cache-Control", "no-cache");
        } else if (/\.[0-9a-f]{8,}\./i.test(path.basename(filePath)) || filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );
  // SPA fallback for non-API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(frontendDir, "index.html"));
  });
} else {
  // No frontend build present — keep a simple health response at root
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
}

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
