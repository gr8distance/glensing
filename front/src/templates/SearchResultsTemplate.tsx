import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { Package } from "../data/packages";
import { PackageCard } from "../components/PackageCard";
import { useTranslations, localePath, type Locale } from "../i18n";
import "./SearchResultsTemplate.css";

interface Props {
  query: string;
  results: Package[];
  allPackages: Package[];
  locale?: Locale;
}

type SortKey = "relevance" | "used_by" | "name_asc" | "name_desc";

// ---------------------------------------------------------------------------
// Scoring & search
// ---------------------------------------------------------------------------

function normalizeQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  if (!lower) return [];
  // Generate both with and without cl- prefix
  const queries = [lower];
  if (lower.startsWith("cl-")) {
    queries.push(lower.slice(3));
  } else {
    queries.push(`cl-${lower}`);
  }
  return queries;
}

function scorePackage(pkg: Package, queries: string[]): number {
  let best = 0;
  const name = pkg.name.toLowerCase();
  const desc = pkg.desc.toLowerCase();
  const author = (pkg.author || "").toLowerCase();

  for (const q of queries) {
    let score = 0;

    // Name scoring
    if (name === q) {
      score = Math.max(score, 1000);
    } else if (name.startsWith(q)) {
      score = Math.max(score, 500);
    } else if (name.includes(q)) {
      score = Math.max(score, 200);
    }

    // Description scoring
    if (desc.includes(q)) {
      score = Math.max(score, score > 0 ? score : 100);
    }

    // Author scoring
    if (author.includes(q)) {
      score = Math.max(score, score > 0 ? score : 50);
    }

    best = Math.max(best, score);
  }

  // Popularity bonus: used_by_count * 2, capped at 100
  const usedByCount = pkg.reverseDeps?.length ?? 0;
  const popularityBonus = Math.min(usedByCount * 2, 100);

  return best > 0 ? best + popularityBonus : 0;
}

function searchAndScore(packages: Package[], q: string): (Package & { _score: number })[] {
  const queries = normalizeQuery(q);
  if (queries.length === 0) return [];

  const scored: (Package & { _score: number })[] = [];
  for (const pkg of packages) {
    const score = scorePackage(pkg, queries);
    if (score > 0) {
      scored.push({ ...pkg, _score: score });
    }
  }
  return scored;
}

function sortPackages(packages: (Package & { _score?: number })[], sort: SortKey): Package[] {
  const arr = [...packages];
  switch (sort) {
    case "relevance":
      return arr.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
    case "used_by":
      return arr.sort((a, b) => (b.reverseDeps?.length ?? 0) - (a.reverseDeps?.length ?? 0));
    case "name_asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchResultsTemplate({ query: initialQuery, allPackages, locale = "en" }: Props) {
  const t = useTranslations(locale);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read initial state from URL
  const [input, setInput] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>(initialQuery ? "relevance" : "name_asc");
  const [debouncedInput, setDebouncedInput] = useState(initialQuery);

  // Debounce search input (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 150);
    return () => clearTimeout(timer);
  }, [input]);

  // Search + sort
  const results = useMemo(() => {
    const q = debouncedInput.trim();
    if (!q) {
      // No query: show all, sorted by current sort (default: name_asc)
      const effectiveSort = sort === "relevance" ? "name_asc" : sort;
      return sortPackages(allPackages.map((p) => ({ ...p, _score: 0 })), effectiveSort);
    }
    const scored = searchAndScore(allPackages, q);
    return sortPackages(scored, sort);
  }, [debouncedInput, sort, allPackages]);

  // URL sync
  const updateUrl = useCallback((q: string, s: SortKey) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (s !== (q ? "relevance" : "name_asc")) params.set("sort", s);
    const base = localePath(locale, "/packages");
    const url = params.toString() ? `${base}?${params}` : base;
    window.history.replaceState(null, "", url);
  }, [locale]);

  useEffect(() => {
    updateUrl(debouncedInput, sort);
  }, [debouncedInput, sort, updateUrl]);

  // Read URL on popstate (browser back/forward)
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      setInput(params.get("q") || "");
      setSort((params.get("sort") as SortKey) || (params.get("q") ? "relevance" : "name_asc"));
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setInput("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Switch to relevance sort when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim() && sort !== "relevance") setSort("relevance");
  };

  const clearSearch = () => {
    setInput("");
    setSort("name_asc");
    inputRef.current?.focus();
  };

  const isSearching = debouncedInput.trim().length > 0;

  return (
    <main className="search-page">
      <div className="container">
        {/* Search bar */}
        <div className="search-bar" role="search" aria-label="Search packages">
          <div className="search-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={t.search.placeholder}
              value={input}
              onChange={handleChange}
              autoFocus
            />
            {input && (
              <button className="search-clear" onClick={clearSearch} aria-label="Clear search">&times;</button>
            )}
            <kbd className="search-kbd">/</kbd>
          </div>

          {/* Sort selector */}
          <select
            className="search-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort order"
          >
            {isSearching && <option value="relevance">{t.search.sortRelevance}</option>}
            <option value="used_by">{t.search.sortMostUsed}</option>
            <option value="name_asc">{t.search.sortNameAsc}</option>
            <option value="name_desc">{t.search.sortNameDesc}</option>
          </select>
        </div>

        {/* Results count */}
        <p className="search-count" aria-live="polite">
          {isSearching
            ? t.search.resultsFor(results.length, debouncedInput)
            : t.search.count(results.length)}
        </p>

        {/* Results grid or empty state */}
        {results.length > 0 ? (
          <div className="search-grid">
            {results.map((pkg) => (
              <PackageCard key={pkg.name} pkg={pkg} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="search-empty">
            <p className="search-empty-title">{t.search.emptyTitle(debouncedInput)}</p>
            <p className="search-empty-hint">
              {t.search.emptyHint}{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); clearSearch(); }}>
                {t.search.emptyBrowse(allPackages.length)}
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
