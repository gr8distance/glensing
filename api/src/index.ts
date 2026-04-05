import { Hono } from "hono";
import { cors } from "hono/cors";
import { packages } from "./routes/packages";

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

// CORS for front-end access
app.use(
  "/api/*",
  cors({
    origin: ["https://gargantua.space", "http://localhost:4321", "http://localhost:8092"],
    allowMethods: ["GET"],
  })
);

// Health check
app.get("/", (c) => c.json({ name: "gargantua-api", version: "0.1.0" }));

// Package routes
app.route("/api/v1/packages", packages);

export default app;
