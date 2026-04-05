import type { Package } from "../data/packages";
import { localePath, type Locale } from "../i18n";

interface Props {
  pkg: Package;
  compact?: boolean;
  locale?: Locale;
}

export function PackageCard({ pkg, compact = false, locale = "en" }: Props) {
  return (
    <a href={localePath(locale, `/packages/${pkg.name}`)} className={`pkg-card ${compact ? "compact" : ""}`}>
      <div className="pkg-card-name">{pkg.name}</div>
      <div className="pkg-card-desc">{pkg.desc}</div>
      {!compact && pkg.version && (
        <div className="pkg-card-meta">
          <span className="pkg-card-version">v{pkg.version}</span>
          {pkg.license && <span className="pkg-card-license">{pkg.license}</span>}
        </div>
      )}
    </a>
  );
}
