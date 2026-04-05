import type { Package } from "../data/packages";

interface Props {
  pkg: Package;
  compact?: boolean;
}

export function PackageCard({ pkg, compact = false }: Props) {
  return (
    <a href={`/packages/${pkg.name}`} className={`pkg-card ${compact ? "compact" : ""}`}>
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
