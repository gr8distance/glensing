import type { Package } from "../data/packages";
import { InstallCommand } from "../components/InstallCommand";
import { DependencyList } from "../components/DependencyList";
import { PageLinks, getLinks } from "../components/PageLinks";
import { useTranslations, localePath, type Locale } from "../i18n";
import "./PackageDetailTemplate.css";

interface Props {
  pkg: Package;
  locale?: Locale;
}

export function PackageDetailTemplate({ pkg, locale = "en" }: Props) {
  const t = useTranslations(locale);
  const links = getLinks(locale);

  return (
    <main className="pkg-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <a href={localePath(locale, "/")}>glensing</a>
          <span className="breadcrumb-sep">/</span>
          <a href={localePath(locale, "/packages")}>{t.nav.packages.toLowerCase()}</a>
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
          <InstallCommand name={pkg.name} locale={locale} />
        </section>

        <section className="pkg-usage">
          <h2>{t.pkg.usage}</h2>
          <pre><code>{`${t.pkg.usageComment1}
${t.pkg.usageComment2}
(in-package :my-project)
(${pkg.name}:some-function ...)`}</code></pre>
        </section>

        <div className="pkg-deps-grid">
          <DependencyList title={t.pkg.deps} deps={pkg.deps || []} locale={locale} />
          <DependencyList title={t.pkg.usedBy} deps={pkg.reverseDeps || []} locale={locale} />
        </div>

        {pkg.repo && (
          <section className="pkg-links">
            <h2>{t.pkg.links}</h2>
            <a href={pkg.repo} target="_blank" rel="noopener noreferrer" className="pkg-repo-link">
              {pkg.repo.includes("quicklisp.org") ? "View on Quicklisp" : t.pkg.source} &rarr;
            </a>
          </section>
        )}
        <PageLinks title={t.pageLinks.more} links={[links.LINK_AREA51, links.LINK_DOCS]} locale={locale} />
      </div>
    </main>
  );
}
