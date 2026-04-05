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
            across machines. No more manual <code>ql:quickload</code> &mdash; declare what you need and let area51
            handle the rest.
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
              <span className="a51-arrow-text">area51 install</span>
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
            <h3 className="a51-cmd-name">init</h3>
            <p className="a51-cmd-desc">Initialize a new project with an area51 manifest.</p>
            <pre><code>area51 init my-project</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">install</h3>
            <p className="a51-cmd-desc">Install dependencies from the registry.</p>
            <pre><code>{`area51 install alexandria
area51 install  # install all from manifest`}</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">search</h3>
            <p className="a51-cmd-desc">Search the gargantua registry for packages.</p>
            <pre><code>area51 search json</code></pre>
          </div>

          <div className="a51-cmd-block">
            <h3 className="a51-cmd-name">update</h3>
            <p className="a51-cmd-desc">Update dependencies to their latest compatible versions.</p>
            <pre><code>{`area51 update           # update all
area51 update bordeaux-threads  # update one`}</code></pre>
          </div>
        </section>

        {/* Config */}
        <section className="a51-section">
          <h2 className="a51-heading">Configuration</h2>
          <p className="a51-text">
            area51 stores its configuration and cache under <code>~/.area51/</code>.
          </p>
          <pre><code>{`~/.area51/
  config.lisp    # global settings
  cache/         # downloaded package tarballs
  registry/      # local registry index
  bin/           # installed CLI tools`}</code></pre>
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

      </div>
    </main>
  );
}
