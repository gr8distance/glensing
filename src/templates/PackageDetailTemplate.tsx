import type { Package } from "../data/packages";
import { InstallCommand } from "../components/InstallCommand";
import { DependencyList } from "../components/DependencyList";
import "./PackageDetailTemplate.css";

interface Props {
  pkg: Package;
}

export function PackageDetailTemplate({ pkg }: Props) {
  return (
    <main className="pkg-detail-page">
      <div className="container">
        <header className="pkg-header">
          <h1 className="pkg-title">{pkg.name}</h1>
          <div className="pkg-meta-row">
            {pkg.version && <span className="pkg-version">v{pkg.version}</span>}
            {pkg.license && <span className="pkg-license">{pkg.license}</span>}
          </div>
          <p className="pkg-desc">{pkg.desc}</p>
        </header>

        <section className="pkg-install">
          <InstallCommand name={pkg.name} />
        </section>

        <section className="pkg-usage">
          <h2>Usage</h2>
          <pre><code>{`;; Add to your system definition
(defsystem "my-project"
  :depends-on ("${pkg.name}"))

;; Or load interactively
(ql:quickload "${pkg.name}")`}</code></pre>
        </section>

        <div className="pkg-deps-grid">
          <DependencyList title="Dependencies" deps={pkg.deps || []} />
          <DependencyList title="Used by" deps={pkg.reverseDeps || []} />
        </div>

        {pkg.repo && (
          <section className="pkg-links">
            <h2>Links</h2>
            <a href={pkg.repo} target="_blank" rel="noopener noreferrer" className="pkg-repo-link">
              Source Repository &rarr;
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
