import { PageLinks, LINK_PACKAGES, LINK_AREA51, LINK_HOME } from "../components/PageLinks";
import "./DocsTemplate.css";

export function DocsTemplate() {
  return (
    <main className="docs-page">
      <div className="container">
        {/* Hero */}
        <header className="docs-hero">
          <p className="docs-hero-label">Documentation</p>
          <h1 className="docs-hero-title">Getting Started</h1>
          <p className="docs-hero-sub">
            Everything you need to start building Common Lisp projects
            with gargantua and the area51 package manager.
          </p>
        </header>

        {/* Prerequisites */}
        <section className="docs-section">
          <h2 className="docs-section-title">Prerequisites</h2>
          <p className="docs-text">
            Before installing area51, you need a working Common Lisp implementation.
            We recommend <strong>SBCL</strong> (Steel Bank Common Lisp) for its performance
            and wide compatibility, but any conforming implementation will work.
          </p>
          <ul className="docs-list">
            <li><strong>SBCL</strong> &mdash; recommended, available on most platforms</li>
            <li><strong>CCL</strong> (Clozure Common Lisp) &mdash; good alternative with native threads</li>
            <li><strong>ECL</strong> (Embeddable Common Lisp) &mdash; compiles to C, ideal for embedding</li>
            <li><strong>ABCL</strong> (Armed Bear Common Lisp) &mdash; runs on the JVM</li>
          </ul>
          <p className="docs-text">
            Verify your installation by running:
          </p>
          <div className="docs-code-block">
            <pre><code>sbcl --version</code></pre>
          </div>
        </section>

        {/* Install area51 */}
        <section className="docs-section">
          <h2 className="docs-section-title">Install area51</h2>
          <p className="docs-text">
            area51 is a single binary with no runtime dependencies.
            Install it with one command:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>curl -fsSL https://gargantua.dev/install.sh | sh</code></pre>
          </div>
          <p className="docs-text">
            This installs the <code>area51</code> binary to <code>~/.local/bin</code>.
            Make sure it is on your <code>PATH</code>. You can verify the installation:
          </p>
          <div className="docs-code-block">
            <pre><code>area51 --version</code></pre>
          </div>
        </section>

        {/* Create a project */}
        <section className="docs-section">
          <h2 className="docs-section-title">Create a Project</h2>
          <p className="docs-text">
            Scaffold a new Common Lisp project with <code>area51 new</code>.
            This generates a standard project structure ready for development.
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 new my-project{"\n"}cd my-project</code></pre>
          </div>
          <p className="docs-text">
            The generated structure:
          </p>
          <div className="docs-file-tree">
            <code>
              <span className="tree-dir">my-project/</span>{"\n"}
              {"  "}<span className="tree-file">area51.lisp</span>{"       "}<span className="tree-comment"># project manifest</span>{"\n"}
              {"  "}<span className="tree-file">my-project.asd</span>{"    "}<span className="tree-comment"># ASDF system definition</span>{"\n"}
              {"  "}<span className="tree-dir">src/</span>{"\n"}
              {"    "}<span className="tree-file">package.lisp</span>{"      "}<span className="tree-comment"># package definition</span>{"\n"}
              {"    "}<span className="tree-file">main.lisp</span>{"         "}<span className="tree-comment"># entry point</span>{"\n"}
              {"  "}<span className="tree-file">.gitignore</span>
            </code>
          </div>
          <ul className="docs-list">
            <li><strong>area51.lisp</strong> &mdash; project manifest. Declares dependencies and metadata.</li>
            <li><strong>my-project.asd</strong> &mdash; ASDF system definition. Auto-updated by <code>area51 add</code> / <code>remove</code>.</li>
            <li><strong>src/package.lisp</strong> &mdash; defines and exports your package symbols.</li>
            <li><strong>src/main.lisp</strong> &mdash; your application code starts here.</li>
          </ul>
        </section>

        {/* Adding packages */}
        <section className="docs-section">
          <h2 className="docs-section-title">Adding Packages</h2>
          <p className="docs-text">
            Add packages with <code>area51 add</code>. This updates both
            your <code>area51.lisp</code> manifest and <code>.asd</code> system definition automatically.
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>{`area51 add alexandria
area51 add my-lib --github user/my-lib
area51 add some-lib --url https://example.com/lib.tar.gz`}</code></pre>
          </div>
          <p className="docs-text">
            Then run <code>area51 install</code> to resolve and download all dependencies:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 install</code></pre>
          </div>
          <p className="docs-text">
            This generates an <code>area51.lock</code> file pinning exact versions for reproducible builds.
            Now you can use the packages in your source files:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">src/main.lisp</span>
            <pre><code>{`(in-package :my-project)

(defun load-config (path)
  (alexandria:read-file-into-string path))`}</code></pre>
          </div>
        </section>

        {/* Searching */}
        <section className="docs-section">
          <h2 className="docs-section-title">Browsing Packages</h2>
          <p className="docs-text">
            Browse and search packages on the web at{" "}
            <a href="/packages">gargantua.space/packages</a>.
          </p>
          <p className="docs-text">
            To see what's installed in your current project:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 list</code></pre>
          </div>
        </section>

        {/* Configuration */}
        <section className="docs-section">
          <h2 className="docs-section-title">Configuration</h2>
          <p className="docs-text">
            area51 stores its configuration and cache in your home directory.
          </p>
          <div className="docs-config-path">~/.area51/</div>
          <div className="docs-file-tree">
            <code>
              <span className="tree-dir">~/.area51/</span>{"\n"}
              {"  "}<span className="tree-dir">packages/</span>{"         "}<span className="tree-comment"># downloaded packages</span>{"\n"}
              {"  "}<span className="tree-dir">quicklisp/</span>{"        "}<span className="tree-comment"># cached Quicklisp index</span>
            </code>
          </div>
          <p className="docs-text">
            Packages are downloaded once and cached here. The Quicklisp index
            is refreshed automatically every 24 hours.
            Run <code>area51 clean</code> to clear the entire cache.
          </p>
        </section>

        {/* Commands reference */}
        <section className="docs-section">
          <h2 className="docs-section-title">Commands Reference</h2>
          <p className="docs-text">
            All available area51 commands at a glance.
          </p>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>area51 new &lt;name&gt;</code></td>
                  <td>Scaffold a new Common Lisp project</td>
                </tr>
                <tr>
                  <td><code>area51 add &lt;pkg&gt;</code></td>
                  <td>Add a dependency to area51.lisp and .asd</td>
                </tr>
                <tr>
                  <td><code>area51 remove &lt;pkg&gt;</code></td>
                  <td>Remove a dependency from the project</td>
                </tr>
                <tr>
                  <td><code>area51 install</code></td>
                  <td>Resolve and download all dependencies, generate lockfile</td>
                </tr>
                <tr>
                  <td><code>area51 list</code></td>
                  <td>List declared dependencies and their status</td>
                </tr>
                <tr>
                  <td><code>area51 build</code></td>
                  <td>Build the project into a standalone binary</td>
                </tr>
                <tr>
                  <td><code>area51 run</code></td>
                  <td>Load and run the project's entry point</td>
                </tr>
                <tr>
                  <td><code>area51 test</code></td>
                  <td>Run the project test suite</td>
                </tr>
                <tr>
                  <td><code>area51 clean</code></td>
                  <td>Clear the package cache (~/.area51/)</td>
                </tr>
                <tr>
                  <td><code>area51 upgrade</code></td>
                  <td>Update area51 itself to the latest version</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <PageLinks links={[LINK_PACKAGES, LINK_AREA51, LINK_HOME]} />
      </div>
    </main>
  );
}
