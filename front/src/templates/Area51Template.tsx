import { PageLinks, getLinks } from "../components/PageLinks";
import { useTranslations, type Locale } from "../i18n";
import "./Area51Template.css";

interface Props {
  locale?: Locale;
}

export function Area51Template({ locale = "en" }: Props) {
  const t = useTranslations(locale);
  const links = getLinks(locale);

  return (
    <main className="a51-page">
      <div className="container">

        {/* Hero */}
        <header className="a51-hero">
          <h1 className="a51-title">area51</h1>
          <p className="a51-subtitle">{t.a51.subtitle}</p>
        </header>

        {/* What is area51 */}
        <section className="a51-section">
          <h2 className="a51-heading">{t.a51.what.title}</h2>
          <p className="a51-text">
            {t.a51.what.desc}
          </p>
        </section>

        {/* Relationship diagram */}
        <section className="a51-section">
          <h2 className="a51-heading">{t.a51.how}</h2>
          <div className="a51-diagram">
            <div className="a51-node a51-node--registry">
              <span className="a51-node-icon">&#x2B50;</span>
              <span className="a51-node-label">Gravity Lensing</span>
              <span className="a51-node-desc">{t.a51.registry}</span>
            </div>
            <div className="a51-arrow">
              <span className="a51-arrow-line" />
              <span className="a51-arrow-text">area51 add / install</span>
              <span className="a51-arrow-line" />
            </div>
            <div className="a51-node a51-node--local">
              <span className="a51-node-icon">&#x1F30D;</span>
              <span className="a51-node-label">{t.a51.local}</span>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className="a51-section">
          <h2 className="a51-heading">{t.a51.installation}</h2>
          <pre><code>curl -fsSL https://gargantua.dev/install.sh | sh</code></pre>
        </section>

        {/* Basic commands */}
        <section className="a51-section">
          <h2 className="a51-heading">{t.a51.commands}</h2>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">new</h3>
            <p className="a51-cmd-desc">{t.a51.cmd.newDesc}</p>
            <pre><code>area51 new my-project</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">add</h3>
            <p className="a51-cmd-desc">{t.a51.cmd.addDesc}</p>
            <pre><code>{`area51 add alexandria
area51 add my-lib --github user/my-lib`}</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">install</h3>
            <p className="a51-cmd-desc">{t.a51.cmd.installDesc}</p>
            <pre><code>area51 install</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">build / run / test</h3>
            <p className="a51-cmd-desc">{t.a51.cmd.buildDesc}</p>
            <pre><code>{`area51 build
area51 run
area51 test`}</code></pre>
          </div>
        </section>

        {/* Config */}
        <section className="a51-section">
          <h2 className="a51-heading">{t.a51.config}</h2>
          <p className="a51-text">
            {t.a51.configDesc} <code>~/.area51/</code>
          </p>
          <pre><code>{`~/.area51/
  packages/      # downloaded packages
  quicklisp/     # cached Quicklisp index`}</code></pre>
        </section>

        {/* GitHub link */}
        <section className="a51-section a51-links">
          <h2 className="a51-heading">{t.a51.source}</h2>
          <a
            href="https://github.com/gargantua-dev/area51"
            target="_blank"
            rel="noopener noreferrer"
            className="a51-gh-link"
          >
            {t.a51.github} &rarr;
          </a>
        </section>

        <PageLinks links={[links.LINK_PACKAGES, links.LINK_DOCS, links.LINK_HOME]} locale={locale} />
      </div>
    </main>
  );
}
