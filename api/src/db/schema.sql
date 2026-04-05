CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '0.0.1',
  license TEXT DEFAULT NULL,
  repository TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dependencies (
  package_id INTEGER NOT NULL REFERENCES packages(id),
  dependency_name TEXT NOT NULL,
  PRIMARY KEY (package_id, dependency_name)
);

CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
