import { PageLinks, LINK_PACKAGES, LINK_DOCS, LINK_HOME } from "../components/PageLinks";
import "./Area51Template.css";

export function Area51Template() {
  return (
    <main className="a51-page">
      <div className="container">

        {/* Hero */}
        <header className="a51-hero">
          <h1 className="a51-title">area51</h1>
          <p className="a51-subtitle">Common Lisp Package Manager</p>
        </header>

        {/* What is area51 */}
        <section className="a51-section">
          <h2 className="a51-heading">What is area51?</h2>
          <p className="a51-text">
            area51 is to Common Lisp what Bundler is to Ruby, Cargo to Rust, and npm to JavaScript.
            It resolves and manages your project dependencies, locking versions and ensuring reproducible builds
            across machines. Declare what you need and let area51 handle the rest &mdash; no Quicklisp
            required at runtime.
          </p>
        </section>

        {/* Relationship diagram */}
        <section className="a51-section">
          <h2 className="a51-heading">How it works</h2>
          <div className="a51-diagram">
            <div className="a51-node a51-node--registry">
              <span className="a51-node-icon">&#x2B50;</span>
              <span className="a51-node-label">gargantua</span>
              <span className="a51-node-desc">registry / space</span>
            </div>
            <div className="a51-arrow">
              <span className="a51-arrow-line" />
              <span className="a51-arrow-text">area51 add / install</span>
              <span className="a51-arrow-line" />
            </div>
            <div className="a51-node a51-node--local">
              <span className="a51-node-icon">&#x1F30D;</span>
              <span className="a51-node-label">your machine</span>
              <span className="a51-node-desc">earth</span>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className="a51-section">
          <h2 className="a51-heading">Installation</h2>
          <pre><code>curl -fsSL https://gargantua.dev/install.sh | sh</code></pre>
        </section>

        {/* Basic commands */}
        <section className="a51-section">
          <h2 className="a51-heading">Basic commands</h2>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">new</h3>
            <p className="a51-cmd-desc">Scaffold a new project with area51.lisp and .asd.</p>
            <pre><code>area51 new my-project</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">add</h3>
            <p className="a51-cmd-desc">Add a dependency to area51.lisp and .asd.</p>
            <pre><code>{`area51 add alexandria
area51 add my-lib --github user/my-lib`}</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">install</h3>
            <p className="a51-cmd-desc">Resolve and download all dependencies.</p>
            <pre><code>area51 install</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">build / run / test</h3>
            <p className="a51-cmd-desc">Build a binary, run the project, or execute tests.</p>
            <pre><code>{`area51 build
area51 run
area51 test`}</code></pre>
          </div>
        </section>

        {/* Config */}
        <section className="a51-section">
          <h2 className="a51-heading">Configuration</h2>
          <p className="a51-text">
            area51 stores its configuration and cache under <code>~/.area51/</code>.
          </p>
          <pre><code>{`~/.area51/
  packages/      # downloaded packages
  quicklisp/     # cached Quicklisp index`}</code></pre>
        </section>

        {/* GitHub link */}
        <section className="a51-section a51-links">
          <h2 className="a51-heading">Source</h2>
          <a
            href="https://github.com/gargantua-dev/area51"
            target="_blank"
            rel="noopener noreferrer"
            className="a51-gh-link"
          >
            View on GitHub &rarr;
          </a>
        </section>

        <PageLinks links={[LINK_PACKAGES, LINK_DOCS, LINK_HOME]} />
      </div>
    </main>
  );
}
