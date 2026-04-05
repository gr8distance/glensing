import { Hono } from "hono";
import type { PackageSummary, PackageDetail } from "../schema";

type Bindings = { DB: D1Database };

const packages = new Hono<{ Bindings: Bindings }>();

// GET /api/v1/packages?q=&page=&per_page=
packages.get("/", async (c) => {
  const db = c.env.DB;
  const q = c.req.query("q") || "";
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const perPage = Math.min(100, Math.max(1, Number(c.req.query("per_page")) || 30));
  const offset = (page - 1) * perPage;

  let countResult: D1Result;
  let rows: D1Result;

  if (q) {
    const like = `%${q}%`;
    countResult = await db
      .prepare("SELECT COUNT(*) as total FROM packages WHERE name LIKE ? OR description LIKE ?")
      .bind(like, like)
      .first() as any;
    rows = await db
      .prepare("SELECT name, description, version, license FROM packages WHERE name LIKE ? OR description LIKE ? ORDER BY name LIMIT ? OFFSET ?")
      .bind(like, like, perPage, offset)
      .all();
  } else {
    countResult = await db
      .prepare("SELECT COUNT(*) as total FROM packages")
      .first() as any;
    rows = await db
      .prepare("SELECT name, description, version, license FROM packages ORDER BY name LIMIT ? OFFSET ?")
      .bind(perPage, offset)
      .all();
  }

  const total = (countResult as any)?.total ?? 0;
  const pkgs: PackageSummary[] = (rows.results || []) as any[];

  return c.json({ packages: pkgs, total, page });
});

// GET /api/v1/packages/:name
packages.get("/:name", async (c) => {
  const db = c.env.DB;
  const name = c.req.param("name");

  const pkg = await db
    .prepare("SELECT name, description, version, license, repository FROM packages WHERE name = ?")
    .bind(name)
    .first();

  if (!pkg) {
    return c.json({ error: "Package not found" }, 404);
  }

  // Get dependencies
  const depsResult = await db
    .prepare("SELECT dependency_name FROM dependencies WHERE package_id = (SELECT id FROM packages WHERE name = ?)")
    .bind(name)
    .all();

  // Get reverse dependencies
  const reverseDepsResult = await db
    .prepare(`
      SELECT p.name FROM packages p
      JOIN dependencies d ON d.package_id = p.id
      WHERE d.dependency_name = ?
    `)
    .bind(name)
    .all();

  const detail: PackageDetail = {
    ...(pkg as any),
    deps: (depsResult.results || []).map((r: any) => r.dependency_name),
    reverse_deps: (reverseDepsResult.results || []).map((r: any) => r.name),
  };

  return c.json(detail);
});

export { packages };
