import type { Package } from "../data/packages";
import { localePath, useTranslations, type Locale } from "../i18n";

interface Props {
  pkg: Package;
  compact?: boolean;
  locale?: Locale;
}

export function PackageCard({ pkg, compact = false, locale = "en" }: Props) {
  const t = useTranslations(locale);
  const usedByCount = pkg.reverseDeps?.length ?? 0;

  return (
    <a href={localePath(locale, `/packages/${pkg.name}`)} className={`pkg-card ${compact ? "compact" : ""}`}>
      <div className="pkg-card-name">{pkg.name}</div>
      <div className="pkg-card-desc">{pkg.desc}</div>
      {!compact && (
        <div className="pkg-card-meta">
          {pkg.license && <span className="pkg-card-license">{pkg.license}</span>}
          {usedByCount > 0 && <span className="pkg-card-used-by">{t.search.usedBy(usedByCount)}</span>}
        </div>
      )}
    </a>
  );
}
