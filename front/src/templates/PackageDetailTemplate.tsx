import type { Package } from "../data/packages";
import { InstallCommand } from "../components/InstallCommand";
import { DependencyList } from "../components/DependencyList";
import { PageLinks, LINK_AREA51, LINK_DOCS } from "../components/PageLinks";
import "./PackageDetailTemplate.css";

interface Props {
  pkg: Package;
}

export function PackageDetailTemplate({ pkg }: Props) {
  return (
    <main className="pkg-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <a href="/">gargantua</a>
          <span className="breadcrumb-sep">/</span>
          <a href="/packages">packages</a>
          <span className="breadcrumb-sep">/</span>
          <span>{pkg.name}</span>
        </nav>
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
          <pre><code>{`;; area51 add updates your .asd automatically.
;; Use the package in your code:
(in-package :my-project)
(${pkg.name}:some-function ...)`}</code></pre>
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
        <PageLinks title="More" links={[LINK_AREA51, LINK_DOCS]} />
      </div>
    </main>
  );
}
