#!/usr/bin/env bun
/**
 * Enrich package data by downloading Quicklisp tarballs and parsing .asd files.
 *
 * - Downloads tarballs in memory (no disk storage)
 * - Extracts .asd files from tar.gz
 * - Parses :description, :license, :author, :depends-on
 * - Merges with existing packages.ts data
 * - Writes updated packages.ts
 *
 * Usage: bun scripts/enrich-packages.ts [--concurrency 20]
 */

import { extract } from "tar-stream";
import { createGunzip } from "zlib";
import { Readable } from "stream";

const QL_DIST = "https://beta.quicklisp.org/dist/quicklisp/2026-01-01";
const CONCURRENCY = parseInt(process.argv.find((a, i) => process.argv[i - 1] === "--concurrency") || "20");

// ---------------------------------------------------------------------------
// .asd S-expression parser (regex-based, handles common patterns)
// ---------------------------------------------------------------------------

function extractStringField(content: string, field: string): string | null {
  // Match :field "value" or :field "multi\nline\nvalue"
  const patterns = [
    new RegExp(`:${field}\\s+"((?:[^"\\\\]|\\\\.)*)"`, "si"),
    new RegExp(`:${field}\\s+#\\.\\(format nil[^)]*\\)`, "si"), // skip format expressions
  ];
  const match = content.match(patterns[0]);
  if (match) return match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
  return null;
}

function extractDependsOn(content: string): string[] {
  // Match :depends-on (...) with various dep formats
  const match = content.match(/:depends-on\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/si);
  if (!match) return [];

  const inner = match[1];
  const deps: string[] = [];

  // Match quoted strings: "dep-name"
  for (const m of inner.matchAll(/"([^"]+)"/g)) deps.push(m[1]);
  // Match keyword symbols: :dep-name
  for (const m of inner.matchAll(/:([a-zA-Z0-9_-]+)/g)) deps.push(m[1]);
  // Match sharp-colon: #:dep-name
  for (const m of inner.matchAll(/#:([a-zA-Z0-9_-]+)/g)) deps.push(m[1]);
  // Match bare symbols (not keywords like :version, :feature, etc.)
  // Only if no other matches found
  if (deps.length === 0) {
    for (const m of inner.matchAll(/\b([a-zA-Z][a-zA-Z0-9_-]*)\b/g)) {
      const name = m[1].toLowerCase();
      if (!["version", "feature", "and", "or", "not", "if", "nil", "t"].includes(name)) {
        deps.push(name);
      }
    }
  }

  return [...new Set(deps.map((d) => d.toLowerCase()))];
}

function extractUrlField(content: string, field: string): string | null {
  // Match :field "url" or :field (:git "url")
  const directMatch = content.match(new RegExp(`:${field}\\s+"(https?://[^"]+)"`, "si"));
  if (directMatch) return directMatch[1];
  const gitMatch = content.match(new RegExp(`:${field}\\s+\\(:git\\s+"(https?://[^"]+)"`, "si"));
  if (gitMatch) return gitMatch[1];
  return null;
}

function parseAsd(content: string): {
  description: string | null;
  license: string | null;
  author: string | null;
  homepage: string | null;
  sourceControl: string | null;
  deps: string[];
} {
  return {
    description: extractStringField(content, "description"),
    license: extractStringField(content, "license") || extractStringField(content, "licence"),
    author: extractStringField(content, "author"),
    homepage: extractUrlField(content, "homepage"),
    sourceControl: extractUrlField(content, "source-control"),
    deps: extractDependsOn(content),
  };
}

// ---------------------------------------------------------------------------
// Tarball downloader + .asd extractor (in-memory, no disk)
// ---------------------------------------------------------------------------

async function extractAsdFromTarball(url: string): Promise<{ filename: string; content: string }[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok || !res.body) return [];

  return new Promise((resolve) => {
    const asdFiles: { filename: string; content: string }[] = [];
    const extractor = extract();
    const gunzip = createGunzip();

    // Timeout for the entire extraction
    const extractTimeout = setTimeout(() => {
      extractor.destroy();
      gunzip.destroy();
      resolve(asdFiles);
    }, 20000);

    extractor.on("entry", (header, stream, next) => {
      if (header.name.endsWith(".asd")) {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          asdFiles.push({
            filename: header.name,
            content: Buffer.concat(chunks).toString("utf-8"),
          });
          next();
        });
      } else {
        stream.on("end", next);
        stream.resume();
      }
    });

    extractor.on("finish", () => { clearTimeout(extractTimeout); resolve(asdFiles); });
    extractor.on("error", () => { clearTimeout(extractTimeout); resolve(asdFiles); });
    gunzip.on("error", () => { clearTimeout(extractTimeout); resolve(asdFiles); });

    // Pipe: response body → gunzip → tar extractor
    const nodeStream = Readable.fromWeb(res.body as any);
    nodeStream.pipe(gunzip).pipe(extractor);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface PackageData {
  name: string;
  desc: string;
  repo: string | null;
  license: string | null;
  author: string | null;
  deps: string[];
  reverseDeps: string[];
  version: string;
  source: string;
}

async function main() {
  console.log("Fetching Quicklisp releases...");
  const releasesText = await (await fetch(`${QL_DIST}/releases.txt`)).text();

  const releases: { name: string; url: string }[] = [];
  for (const line of releasesText.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split(" ");
    releases.push({ name: parts[0], url: parts[1] });
  }

  console.log(`Found ${releases.length} packages. Enriching with ${CONCURRENCY} concurrent downloads...`);

  // Load existing package data for merging
  const existingPath = new URL("../front/src/data/packages.ts", import.meta.url).pathname;
  const existingModule = await import(existingPath);
  const existingPackages: Map<string, any> = new Map();
  for (const pkg of existingModule.PACKAGES) {
    existingPackages.set(pkg.name, pkg);
  }

  const enriched = new Map<string, PackageData>();
  let completed = 0;
  let enrichedCount = 0;

  // Process in batches
  async function processPackage(release: { name: string; url: string }) {
    try {
      const asdFiles = await extractAsdFromTarball(release.url);

      // Find the main .asd (matching project name, or first one)
      const mainAsd =
        asdFiles.find((f) => f.filename.endsWith(`/${release.name}.asd`)) ||
        asdFiles.find((f) => !f.filename.includes("/test") && !f.filename.includes("-test")) ||
        asdFiles[0];

      const existing = existingPackages.get(release.name) || {};
      const parsed = mainAsd ? parseAsd(mainAsd.content) : null;

      // Resolve repo URL: existing > homepage > source-control > quicklisp tarball
      const repo = existing.repo
        || parsed?.homepage
        || parsed?.sourceControl
        || release.url;

      const pkg: PackageData = {
        name: release.name,
        desc: parsed?.description || existing.desc || "",
        repo,
        license: parsed?.license || existing.license || null,
        author: parsed?.author || null,
        deps: (existing.deps?.length > 0 ? existing.deps : parsed?.deps) || [],
        reverseDeps: existing.reverseDeps || [],
        version: existing.version || "latest",
        source: "quicklisp",
      };

      if (parsed?.description) enrichedCount++;
      enriched.set(release.name, pkg);
    } catch {
      // Keep existing data on failure
      const existing = existingPackages.get(release.name);
      if (existing) {
        enriched.set(release.name, { ...existing, source: "quicklisp", author: null });
      }
    }

    completed++;
    if (completed % 100 === 0 || completed === releases.length) {
      const pct = ((completed / releases.length) * 100).toFixed(1);
      console.log(`  ${completed}/${releases.length} (${pct}%) — ${enrichedCount} descriptions found`);
    }
  }

  // Parallel execution with concurrency limit
  const queue = [...releases];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item) await processPackage(item);
    }
  });
  await Promise.all(workers);

  // Rebuild reverse deps from enriched data
  const reverseDeps = new Map<string, Set<string>>();
  for (const [name, pkg] of enriched) {
    for (const dep of pkg.deps) {
      if (!reverseDeps.has(dep)) reverseDeps.set(dep, new Set());
      reverseDeps.get(dep)!.add(name);
    }
  }
  for (const [name, pkg] of enriched) {
    pkg.reverseDeps = [...(reverseDeps.get(name) || [])].filter((r) => enriched.has(r)).sort().slice(0, 20);
  }

  // Sort: packages with descriptions first, then alphabetically
  const sorted = [...enriched.values()].sort((a, b) => {
    if (a.desc && !b.desc) return -1;
    if (!a.desc && b.desc) return 1;
    return a.name.localeCompare(b.name);
  });

  console.log(`\nResults:`);
  console.log(`  Total: ${sorted.length}`);
  console.log(`  With description: ${sorted.filter((p) => p.desc).length}`);
  console.log(`  With license: ${sorted.filter((p) => p.license).length}`);
  console.log(`  With author: ${sorted.filter((p) => p.author).length}`);
  console.log(`  With repo: ${sorted.filter((p) => p.repo && !p.repo.startsWith("http://beta.quicklisp")).length} (from .asd)`);
  console.log(`  With repo (incl. tarball fallback): ${sorted.filter((p) => p.repo).length}`);

  // Write packages.ts
  const tsLines = [
    `export interface Package {`,
    `  name: string;`,
    `  desc: string;`,
    `  repo?: string;`,
    `  license?: string;`,
    `  author?: string;`,
    `  deps?: string[];`,
    `  reverseDeps?: string[];`,
    `  version?: string;`,
    `  source?: string;`,
    `}`,
    ``,
    `export const PACKAGES: Package[] = [`,
  ];

  for (const p of sorted) {
    const parts = [`name: ${JSON.stringify(p.name)}`, `desc: ${JSON.stringify(p.desc)}`];
    if (p.repo) parts.push(`repo: ${JSON.stringify(p.repo)}`);
    if (p.license) parts.push(`license: ${JSON.stringify(p.license)}`);
    if (p.author) parts.push(`author: ${JSON.stringify(p.author)}`);
    if (p.deps.length) parts.push(`deps: ${JSON.stringify(p.deps)}`);
    if (p.reverseDeps.length) parts.push(`reverseDeps: ${JSON.stringify(p.reverseDeps)}`);
    if (p.source) parts.push(`source: ${JSON.stringify(p.source)}`);
    tsLines.push(`  { ${parts.join(", ")} },`);
  }

  tsLines.push(`];`);
  tsLines.push(``);
  tsLines.push(`export const QUICKLISP_DIST_DATE = "2026-01-01";`);
  tsLines.push(``);
  tsLines.push(`export function findPackage(name: string): Package | undefined {`);
  tsLines.push(`  return PACKAGES.find((p) => p.name === name);`);
  tsLines.push(`}`);
  tsLines.push(``);
  tsLines.push(`export function searchPackages(query: string): Package[] {`);
  tsLines.push(`  const q = query.toLowerCase();`);
  tsLines.push(`  return PACKAGES.filter(`);
  tsLines.push(`    (p) => p.name.includes(q) || p.desc.toLowerCase().includes(q)`);
  tsLines.push(`  );`);
  tsLines.push(`}`);

  await Bun.write(existingPath, tsLines.join("\n") + "\n");
  console.log(`\nWrote ${existingPath}`);
  console.log("Done!");
}

main().catch(console.error);
