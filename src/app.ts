import express from "express";
import { invoiceRouter } from "./routes/invoice.js";
import { webhookRouter } from "./routes/webhook.js";
import { policyRouter } from "./routes/policy.js";
import { createLogger } from "./logger.js";

const log = createLogger("app");

export function createApp(): express.Express {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // CORS for dashboard
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Request logging middleware
  app.use((req, _res, next) => {
    log.debug(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    next();
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "OmniCFO", timestamp: new Date().toISOString() });
  });

  // Debug: test Supabase connection
  app.get("/debug", async (_req, res) => {
    try {
      const { listAllInvoices } = await import("./services/supabase.js");
      const invoices = await listAllInvoices();
      res.json({ ok: true, count: invoices.length, env: { url: !!process.env.SUPABASE_URL, key: !!process.env.SUPABASE_SERVICE_KEY } });
    } catch (err) {
      res.json({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  // Routes
  app.use("/api/invoices", invoiceRouter);
  app.use("/api/policy", policyRouter);
  app.use("/webhook", webhookRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    log.error("Unhandled error", { error: err.message, stack: err.stack });
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
