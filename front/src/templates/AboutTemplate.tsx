import { PageLinks, getLinks } from "../components/PageLinks";
import { useTranslations, type Locale } from "../i18n";
import "./AboutTemplate.css";

interface Props {
  locale?: Locale;
}

export function AboutTemplate({ locale = "en" }: Props) {
  const t = useTranslations(locale);
  const links = getLinks(locale);

  return (
    <main className="about-page">
      <div className="container">

        {/* Hero */}
        <header className="about-hero">
          <p className="about-hero-label">{t.about.label}</p>
          <h1 className="about-hero-title">{t.about.title}</h1>
          <p className="about-hero-sub">{t.about.subtitle}</p>
        </header>

        {/* What is glensing */}
        <section className="about-section">
          <h2 className="about-section-title">{t.about.whatGargantua.title}</h2>
          <p className="about-text">{t.about.whatGargantua.desc}</p>
        </section>

        {/* What is area51 */}
        <section className="about-section">
          <h2 className="about-section-title">{t.about.whatArea51.title}</h2>
          <p className="about-text">{t.about.whatArea51.desc}</p>
        </section>

        {/* Relationship */}
        <section className="about-section">
          <h2 className="about-section-title">{t.about.relationship.title}</h2>
          <p className="about-text">{t.about.relationship.desc}</p>
          <div className="about-diagram">
            <div className="about-node about-node--registry">
              <span className="about-node-icon">&#x2B50;</span>
              <span className="about-node-label">Gravity Lensing</span>
              <span className="about-node-desc">{t.about.relationship.registry}</span>
              <span className="about-node-role">{t.about.relationship.browse}</span>
            </div>
            <div className="about-arrow">
              <span className="about-arrow-line" />
              <span className="about-arrow-line" />
            </div>
            <div className="about-node about-node--cli">
              <span className="about-node-icon">&#x1F30D;</span>
              <span className="about-node-label">area51</span>
              <span className="about-node-desc">{t.about.relationship.cli}</span>
              <span className="about-node-role">{t.about.relationship.install}</span>
            </div>
          </div>
        </section>

        {/* Name origin */}
        <section className="about-section">
          <h2 className="about-section-title">{t.about.name.title}</h2>
          <p className="about-text">{t.about.name.desc}</p>
        </section>

        {/* Open source */}
        <section className="about-section">
          <h2 className="about-section-title">{t.about.openSource.title}</h2>
          <p className="about-text">{t.about.openSource.desc}</p>
          <div className="about-links">
            <a
              href="https://github.com/gr8distance/glensing"
              target="_blank"
              rel="noopener noreferrer"
              className="about-gh-link"
            >
              {t.about.gargantuaRepo} &rarr;
            </a>
            <a
              href="https://github.com/gr8distance/area51"
              target="_blank"
              rel="noopener noreferrer"
              className="about-gh-link"
            >
              {t.about.area51Repo} &rarr;
            </a>
          </div>
        </section>

        <PageLinks links={[links.LINK_PACKAGES, links.LINK_AREA51, links.LINK_DOCS, links.LINK_HOME]} locale={locale} />
      </div>
    </main>
  );
}
