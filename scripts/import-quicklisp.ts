#!/usr/bin/env bun
/**
 * Import packages from Quicklisp distribution into gargantua.
 *
 * Fetches releases.txt + systems.txt, resolves GitHub descriptions,
 * and writes front/src/data/packages.ts + api/src/db/seed.sql.
 */

const QL_DIST = "https://beta.quicklisp.org/dist/quicklisp/2026-01-01";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional, increases rate limit

interface PkgInfo {
  name: string;
  desc: string;
  repo: string | null;
  license: string | null;
  version: string;
  deps: string[];
  reverseDeps: string[];
}

// ---------------------------------------------------------------------------
// 1. Fetch Quicklisp data
// ---------------------------------------------------------------------------
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

function parseReleases(text: string): Map<string, { url: string }> {
  const map = new Map<string, { url: string }>();
  for (const line of text.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split(" ");
    const name = parts[0];
    const url = parts[1];
    map.set(name, { url });
  }
  return map;
}

function parseSystems(text: string): Map<string, Set<string>> {
  // project -> set of dependency project names
  const deps = new Map<string, Set<string>>();
  for (const line of text.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split(" ");
    const project = parts[0];
    // parts[1] = system-file, parts[2] = system-name, rest = deps
    const systemDeps = parts.slice(3);
    if (!deps.has(project)) deps.set(project, new Set());
    const s = deps.get(project)!;
    for (const d of systemDeps) {
      // Dependency names can be system names; we need to map to project names
      // For now, store raw names and resolve later
      s.add(d);
    }
  }
  return deps;
}

// Map system names to project names
function buildSystemToProject(systemsText: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of systemsText.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const parts = line.split(" ");
    const project = parts[0];
    const systemName = parts[2];
    if (!map.has(systemName)) {
      map.set(systemName, project);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// 2. Extract GitHub repo URLs from Quicklisp archive URLs
// ---------------------------------------------------------------------------
function guessGithubRepo(projectName: string): string | null {
  // We'll try to fetch from a known mapping or guess
  return null; // Will be enriched via GitHub search
}

// ---------------------------------------------------------------------------
// 3. Fetch GitHub descriptions in batches
// ---------------------------------------------------------------------------
async function fetchGithubDesc(
  owner: string,
  repo: string
): Promise<{ desc: string; license: string | null } | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "gargantua-importer",
  };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    return {
      desc: data.description || "",
      license: data.license?.spdx_id || null,
    };
  } catch {
    return null;
  }
}

// Well-known GitHub mappings for popular CL packages
const KNOWN_REPOS: Record<string, string> = {
  alexandria: "alexandria-project/alexandria",
  "cl-ppcre": "edicl/cl-ppcre",
  "bordeaux-threads": "sionescu/bordeaux-threads",
  usocket: "usocket/usocket",
  dexador: "fukamachi/dexador",
  jonathan: "Rudolph-Miller/jonathan",
  lack: "fukamachi/lack",
  ningle: "fukamachi/ningle",
  sxql: "fukamachi/sxql",
  mito: "fukamachi/mito",
  "cl-async": "orthecreedence/cl-async",
  ironclad: "sharplispers/ironclad",
  lparallel: "lmj/lparallel",
  trivia: "guicho271828/trivia",
  str: "vindarel/cl-str",
  log4cl: "sharplispers/log4cl",
  fiveam: "lispci/fiveam",
  parachute: "Shinmera/parachute",
  arrows: "Harleqin/arrows",
  serapeum: "ruricolist/serapeum",
  "cl-json": "sharplispers/cl-json",
  hunchentoot: "edicl/hunchentoot",
  "closer-mop": "pcostanza/closer-mop",
  cffi: "cffi/cffi",
  "flexi-streams": "edicl/flexi-streams",
  "split-sequence": "sharplispers/split-sequence",
  iterate: "sharplispers/iterate",
  "local-time": "dlowe-net/local-time",
  "cl-who": "edicl/cl-who",
  "cl-css": "Shinmera/cl-css",
  "cl-fad": "edicl/cl-fad",
  babel: "cl-babel/babel",
  nibbles: "sharplispers/nibbles",
  "named-readtables": "melisgl/named-readtables",
  optima: "m2ym/optima",
  "cl-dbi": "fukamachi/cl-dbi",
  datafly: "fukamachi/datafly",
  clack: "fukamachi/clack",
  caveman: "fukamachi/caveman",
  woo: "fukamachi/woo",
  "cl-markdown": "hraban/cl-markdown",
  quri: "fukamachi/quri",
  "fast-io": "rpav/fast-io",
  "cl-interpol": "edicl/cl-interpol",
  "cl-unicode": "edicl/cl-unicode",
  chunga: "edicl/chunga",
  drakma: "edicl/drakma",
  "cl-base64": "sharplispers/cl-base64",
  chipz: "sharplispers/chipz",
  salza2: "xach/salza2",
  zpng: "xach/zpng",
  vecto: "xach/vecto",
  zpb: "xach/zpb-ttf",
  plump: "Shinmera/plump",
  lquery: "Shinmera/lquery",
  clss: "Shinmera/CLSS",
  "array-utils": "Shinmera/array-utils",
  "documentation-utils": "Shinmera/documentation-utils",
  dissect: "Shinmera/dissect",
  "trivial-indent": "Shinmera/trivial-indent",
  "trivial-garbage": "trivial-garbage/trivial-garbage",
  "trivial-gray-streams": "trivial-gray-streams/trivial-gray-streams",
  "trivial-features": "trivial-features/trivial-features",
  "trivial-backtrace": "gwkkwg/trivial-backtrace",
  "trivial-types": "m2ym/trivial-types",
  "trivial-utf-8": "trivial-utf-8/trivial-utf-8",
  "trivial-mimes": "Shinmera/trivial-mimes",
  cl4l: "edicl/cl4l",
  postmodern: "marijnh/Postmodern",
  "cl-postgres": "marijnh/Postmodern",
  "simple-date": "marijnh/Postmodern",
  "s-sql": "marijnh/Postmodern",
  "cl-store": "skypher/cl-store",
  "static-vectors": "sionescu/static-vectors",
  "symbol-munger": "AccelerationNet/symbol-munger",
  "access": "AccelerationNet/access",
  "cl-containers": "gwkkwg/cl-containers",
  metatilities: "gwkkwg/metatilities",
  "asdf-system-connections": "gwkkwg/asdf-system-connections",
  "anaphora": "spwhitton/anaphora",
  "let-plus": "sharplispers/let-plus",
  "parse-number": "sharplispers/parse-number",
  "cl-change-case": "rudolfochrist/cl-change-case",
  "cl-slug": "EuAndr662/cl-slug",
  djula: "mmontone/djula",
  "cl-locale": "fukamachi/cl-locale",
  "cl-project": "fukamachi/cl-project",
  lass: "Shinmera/LASS",
  "cl-cookie": "fukamachi/cl-cookie",
  "circular-streams": "fukamachi/circular-streams",
  "cl-syntax": "m2ym/cl-syntax",
  "cl-annot": "m2ym/cl-annot",
  "cl-colors2": "neil-lindquist/cl-colors2",
  "cl-ansi-text": "pnathan/cl-ansi-text",
  prove: "fukamachi/prove",
  rove: "fukamachi/rove",
  "check-it": "DalekBaldworthy/check-it",
  fiasco: "joaotavora/fiasco",
  spinneret: "ruricolist/spinneret",
  "global-vars": "lmj/global-vars",
  "parse-float": "soemraws/parse-float",
};

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Fetching Quicklisp data...");
  const [releasesText, systemsText] = await Promise.all([
    fetchText(`${QL_DIST}/releases.txt`),
    fetchText(`${QL_DIST}/systems.txt`),
  ]);

  const releases = parseReleases(releasesText);
  const rawDeps = parseSystems(systemsText);
  const sysToProject = buildSystemToProject(systemsText);

  console.log(`Found ${releases.size} projects, ${rawDeps.size} with systems`);

  // Resolve deps: system names -> project names, filter self-deps
  const projectDeps = new Map<string, string[]>();
  for (const [project, sysDeps] of rawDeps) {
    const resolved = new Set<string>();
    for (const sd of sysDeps) {
      const depProject = sysToProject.get(sd);
      if (depProject && depProject !== project) {
        resolved.add(depProject);
      }
    }
    projectDeps.set(project, [...resolved].sort());
  }

  // Build reverse deps
  const reverseDeps = new Map<string, Set<string>>();
  for (const [project, deps] of projectDeps) {
    for (const dep of deps) {
      if (!reverseDeps.has(dep)) reverseDeps.set(dep, new Set());
      reverseDeps.get(dep)!.add(project);
    }
  }

  // Fetch GitHub descriptions for known repos
  console.log("Fetching GitHub descriptions for known repos...");
  const ghDescriptions = new Map<string, { desc: string; license: string | null }>();

  const knownEntries = Object.entries(KNOWN_REPOS);
  // Batch in groups of 10 to avoid rate limits
  for (let i = 0; i < knownEntries.length; i += 10) {
    const batch = knownEntries.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async ([name, repo]) => {
        const [owner, repoName] = repo.split("/");
        const data = await fetchGithubDesc(owner, repoName);
        return [name, data] as const;
      })
    );
    for (const [name, data] of results) {
      if (data) ghDescriptions.set(name, data);
    }
    if (i + 10 < knownEntries.length) {
      await new Promise((r) => setTimeout(r, 500)); // rate limit pause
    }
  }
  console.log(`Got descriptions for ${ghDescriptions.size} packages`);

  // Build package list
  const packages: PkgInfo[] = [];
  for (const [name] of releases) {
    const gh = ghDescriptions.get(name);
    const deps = projectDeps.get(name) || [];
    const revDeps = [...(reverseDeps.get(name) || [])].sort();

    // Only include reverse deps that are in our release set (max 10)
    const filteredRevDeps = revDeps.filter((r) => releases.has(r)).slice(0, 10);
    // Only include deps that are in our release set
    const filteredDeps = deps.filter((d) => releases.has(d));

    const repoUrl = KNOWN_REPOS[name]
      ? `https://github.com/${KNOWN_REPOS[name]}`
      : null;

    packages.push({
      name,
      desc: gh?.desc || "",
      repo: repoUrl,
      license: gh?.license === "NOASSERTION" ? null : (gh?.license || null),
      version: "latest",
      deps: filteredDeps,
      reverseDeps: filteredRevDeps,
    });
  }

  // Sort: packages with descriptions first, then alphabetically
  packages.sort((a, b) => {
    if (a.desc && !b.desc) return -1;
    if (!a.desc && b.desc) return 1;
    return a.name.localeCompare(b.name);
  });

  console.log(`Total packages: ${packages.length}`);
  console.log(`With descriptions: ${packages.filter((p) => p.desc).length}`);

  // ---------------------------------------------------------------------------
  // Write packages.ts
  // ---------------------------------------------------------------------------
  const tsLines = [
    `export interface Package {`,
    `  name: string;`,
    `  desc: string;`,
    `  repo?: string;`,
    `  license?: string;`,
    `  deps?: string[];`,
    `  reverseDeps?: string[];`,
    `  version?: string;`,
    `}`,
    ``,
    `export const PACKAGES: Package[] = [`,
  ];

  for (const p of packages) {
    const parts = [`name: ${JSON.stringify(p.name)}`, `desc: ${JSON.stringify(p.desc)}`];
    if (p.repo) parts.push(`repo: ${JSON.stringify(p.repo)}`);
    if (p.license) parts.push(`license: ${JSON.stringify(p.license)}`);
    if (p.version !== "latest") parts.push(`version: ${JSON.stringify(p.version)}`);
    if (p.deps.length) parts.push(`deps: ${JSON.stringify(p.deps)}`);
    if (p.reverseDeps.length) parts.push(`reverseDeps: ${JSON.stringify(p.reverseDeps)}`);
    tsLines.push(`  { ${parts.join(", ")} },`);
  }

  tsLines.push(`];`);
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

  const tsPath = new URL("../front/src/data/packages.ts", import.meta.url).pathname;
  await Bun.write(tsPath, tsLines.join("\n") + "\n");
  console.log(`Wrote ${tsPath}`);

  // ---------------------------------------------------------------------------
  // Write seed.sql
  // ---------------------------------------------------------------------------
  const sqlLines = [];

  // Batch inserts (SQLite limit ~500 per statement)
  const BATCH = 200;
  for (let i = 0; i < packages.length; i += BATCH) {
    const batch = packages.slice(i, i + BATCH);
    sqlLines.push(
      `INSERT OR IGNORE INTO packages (name, description, version, license, repository) VALUES`
    );
    const vals = batch.map((p) => {
      const esc = (s: string | null) => (s ? `'${s.replace(/'/g, "''")}'` : "NULL");
      return `  (${esc(p.name)}, ${esc(p.desc)}, ${esc(p.version)}, ${esc(p.license)}, ${esc(p.repo)})`;
    });
    sqlLines.push(vals.join(",\n") + ";");
    sqlLines.push("");
  }

  // Dependencies
  sqlLines.push("-- Dependencies");
  for (const p of packages) {
    for (const dep of p.deps) {
      sqlLines.push(
        `INSERT OR IGNORE INTO dependencies (package_id, dependency_name) VALUES ((SELECT id FROM packages WHERE name='${p.name.replace(/'/g, "''")}'), '${dep.replace(/'/g, "''")}');`
      );
    }
  }

  const sqlPath = new URL("../api/src/db/seed.sql", import.meta.url).pathname;
  await Bun.write(sqlPath, sqlLines.join("\n") + "\n");
  console.log(`Wrote ${sqlPath}`);

  console.log("Done!");
}

main().catch(console.error);
