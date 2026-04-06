import { PageLinks, getLinks } from "../components/PageLinks";
import { useTranslations, localePath, type Locale } from "../i18n";
import "./DocsTemplate.css";

interface Props {
  locale?: Locale;
}

export function DocsTemplate({ locale = "en" }: Props) {
  const t = useTranslations(locale);
  const links = getLinks(locale);

  return (
    <main className="docs-page">
      <div className="container">
        {/* Hero */}
        <header className="docs-hero">
          <p className="docs-hero-label">{t.docs.label}</p>
          <h1 className="docs-hero-title">{t.docs.title}</h1>
          <p className="docs-hero-sub">{t.docs.subtitle}</p>
        </header>

        {/* Prerequisites */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.prerequisites.title}</h2>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.prerequisites.text }} />
          <ul className="docs-list">
            <li><strong>SBCL</strong> &mdash; {t.docs.prerequisites.sbcl}</li>
            <li><strong>CCL</strong> (Clozure Common Lisp) &mdash; {t.docs.prerequisites.ccl}</li>
            <li><strong>ECL</strong> (Embeddable Common Lisp) &mdash; {t.docs.prerequisites.ecl}</li>
            <li><strong>ABCL</strong> (Armed Bear Common Lisp) &mdash; {t.docs.prerequisites.abcl}</li>
          </ul>
          <p className="docs-text">{t.docs.prerequisites.verify}</p>
          <div className="docs-code-block">
            <pre><code>sbcl --version</code></pre>
          </div>
        </section>

        {/* Install area51 */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.install.title}</h2>
          <p className="docs-text">{t.docs.install.text}</p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>curl -fsSL https://raw.githubusercontent.com/gr8distance/area51/main/install.sh | bash</code></pre>
          </div>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.install.path }} />
          <div className="docs-code-block">
            <pre><code>area51 --version</code></pre>
          </div>
        </section>

        {/* Create a project */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.create.title}</h2>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.create.text }} />
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 new my-project{"\n"}cd my-project</code></pre>
          </div>
          <p className="docs-text">{t.docs.create.structure}</p>
          <div className="docs-file-tree">
            <code>
              <span className="tree-dir">my-project/</span>{"\n"}
              {"  "}<span className="tree-file">area51.lisp</span>{"       "}<span className="tree-comment"># {t.docs.create.manifest}</span>{"\n"}
              {"  "}<span className="tree-file">my-project.asd</span>{"    "}<span className="tree-comment"># {t.docs.create.asd}</span>{"\n"}
              {"  "}<span className="tree-dir">src/</span>{"\n"}
              {"    "}<span className="tree-file">package.lisp</span>{"      "}<span className="tree-comment"># {t.docs.create.packageLisp}</span>{"\n"}
              {"    "}<span className="tree-file">main.lisp</span>{"         "}<span className="tree-comment"># {t.docs.create.mainLisp}</span>{"\n"}
              {"  "}<span className="tree-file">.gitignore</span>
            </code>
          </div>
          <ul className="docs-list">
            <li><strong>area51.lisp</strong> &mdash; <span dangerouslySetInnerHTML={{ __html: t.docs.create.items.area51Lisp }} /></li>
            <li><strong>my-project.asd</strong> &mdash; <span dangerouslySetInnerHTML={{ __html: t.docs.create.items.asd }} /></li>
            <li><strong>src/package.lisp</strong> &mdash; {t.docs.create.items.packageLisp}</li>
            <li><strong>src/main.lisp</strong> &mdash; {t.docs.create.items.mainLisp}</li>
          </ul>
        </section>

        {/* Adding packages */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.adding.title}</h2>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.adding.text }} />
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>{`area51 add alexandria
area51 add my-lib --github user/my-lib
area51 add some-lib --url https://example.com/lib.tar.gz`}</code></pre>
          </div>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.adding.install }} />
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 install</code></pre>
          </div>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.adding.lock }} />
          <div className="docs-code-block">
            <span className="docs-code-label">src/main.lisp</span>
            <pre><code>{`(in-package :my-project)

(defun load-config (path)
  (alexandria:read-file-into-string path))`}</code></pre>
          </div>
        </section>

        {/* Searching */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.browsing.title}</h2>
          <p className="docs-text">
            {t.docs.browsing.text}{" "}
            <a href={localePath(locale, "/packages")}>glensing.dev/packages</a>.
          </p>
          <p className="docs-text">{t.docs.browsing.installed}</p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 list</code></pre>
          </div>
        </section>

        {/* Configuration */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.configTitle}</h2>
          <p className="docs-text">{t.docs.configText}</p>
          <div className="docs-config-path">~/.area51/</div>
          <div className="docs-file-tree">
            <code>
              <span className="tree-dir">~/.area51/</span>{"\n"}
              {"  "}<span className="tree-dir">packages/</span>{"         "}<span className="tree-comment"># {t.docs.treeDownloaded}</span>{"\n"}
              {"  "}<span className="tree-dir">quicklisp/</span>{"        "}<span className="tree-comment"># {t.docs.treeCachedIndex}</span>
            </code>
          </div>
          <p className="docs-text" dangerouslySetInnerHTML={{ __html: t.docs.configCache }} />
        </section>

        {/* Commands reference */}
        <section className="docs-section">
          <h2 className="docs-section-title">{t.docs.commands.title}</h2>
          <p className="docs-text">{t.docs.commands.text}</p>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>{t.docs.commands.command}</th>
                  <th>{t.docs.commands.description}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>area51 new &lt;name&gt;</code></td><td>{t.docs.commands.newDesc}</td></tr>
                <tr><td><code>area51 add &lt;pkg&gt;</code></td><td>{t.docs.commands.addDesc}</td></tr>
                <tr><td><code>area51 remove &lt;pkg&gt;</code></td><td>{t.docs.commands.removeDesc}</td></tr>
                <tr><td><code>area51 install</code></td><td>{t.docs.commands.installDesc}</td></tr>
                <tr><td><code>area51 list</code></td><td>{t.docs.commands.listDesc}</td></tr>
                <tr><td><code>area51 build</code></td><td>{t.docs.commands.buildDesc}</td></tr>
                <tr><td><code>area51 run</code></td><td>{t.docs.commands.runDesc}</td></tr>
                <tr><td><code>area51 test</code></td><td>{t.docs.commands.testDesc}</td></tr>
                <tr><td><code>area51 clean</code></td><td>{t.docs.commands.cleanDesc}</td></tr>
                <tr><td><code>area51 upgrade</code></td><td>{t.docs.commands.upgradeDesc}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <PageLinks links={[links.LINK_PACKAGES, links.LINK_AREA51, links.LINK_HOME]} locale={locale} />
      </div>
    </main>
  );
}
