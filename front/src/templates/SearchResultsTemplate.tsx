import { useState, useMemo } from "react";
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

function filterPackages(packages: Package[], q: string): Package[] {
  const lower = q.toLowerCase();
  return packages.filter(
    (p) => p.name.includes(lower) || p.desc.toLowerCase().includes(lower)
  );
}

export function SearchResultsTemplate({ query, results, allPackages, locale = "en" }: Props) {
  const [input, setInput] = useState(query);
  const t = useTranslations(locale);

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
      const base = localePath(locale, "/packages");
      window.location.href = `${base}${input ? `?${params}` : ""}`;
    }
  };

  return (
    <main className="search-page">
      <div className="container">
        <div className="search-input-wrap">
          <input
            type="text"
            className="search-input"
            placeholder={t.search.placeholder}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {filtered.length > 0 ? (
          <>
            <p className="search-count">
              {t.search.count(filtered.length)}
            </p>
            <div className="search-grid">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.name} pkg={pkg} locale={locale} />
              ))}
            </div>
          </>
        ) : (
          <div className="search-empty">
            <p className="search-empty-title">{t.search.emptyTitle}</p>
            <p className="search-empty-hint">{t.search.emptyHint}</p>
          </div>
        )}
      </div>
    </main>
  );
}
