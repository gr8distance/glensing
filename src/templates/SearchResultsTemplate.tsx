import { useState, useMemo } from "react";
import type { Package } from "../data/packages";
import { PackageCard } from "../components/PackageCard";
import "./SearchResultsTemplate.css";

interface Props {
  query: string;
  results: Package[];
  allPackages: Package[];
}

function filterPackages(packages: Package[], q: string): Package[] {
  const lower = q.toLowerCase();
  return packages.filter(
    (p) => p.name.includes(lower) || p.desc.toLowerCase().includes(lower)
  );
}

export function SearchResultsTemplate({ query, results, allPackages }: Props) {
  const [input, setInput] = useState(query);

  const filtered = useMemo(
    () => (input === query ? results : filterPackages(allPackages, input)),
    [input, query, results, allPackages]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams();
      if (input) params.set("search", input);
      window.location.href = `/packages${input ? `?${params}` : ""}`;
    }
  };

  return (
    <main className="search-page">
      <div className="container">
        <div className="search-input-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search packages..."
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {filtered.length > 0 ? (
          <>
            <p className="search-count">
              {filtered.length} package{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="search-grid">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.name} pkg={pkg} />
              ))}
            </div>
          </>
        ) : (
          <div className="search-empty">
            <p className="search-empty-title">No packages found in orbit</p>
            <p className="search-empty-hint">
              Try a different search term or browse all packages
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
