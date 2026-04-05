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
            Scaffold a new Common Lisp project with <code>area51 init</code>.
            This generates a standard project structure ready for development.
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 init my-project{"\n"}cd my-project</code></pre>
          </div>
          <p className="docs-text">
            The generated structure:
          </p>
          <div className="docs-file-tree">
            <code>
              <span className="tree-dir">my-project/</span>{"\n"}
              {"  "}<span className="tree-file">my-project.asd</span>{"     "}<span className="tree-comment"># system definition</span>{"\n"}
              {"  "}<span className="tree-dir">src/</span>{"\n"}
              {"    "}<span className="tree-file">main.lisp</span>{"        "}<span className="tree-comment"># entry point</span>{"\n"}
              {"    "}<span className="tree-file">package.lisp</span>{"      "}<span className="tree-comment"># package definition</span>{"\n"}
              {"  "}<span className="tree-dir">tests/</span>{"\n"}
              {"    "}<span className="tree-file">main-test.lisp</span>{"    "}<span className="tree-comment"># test suite</span>{"\n"}
              {"  "}<span className="tree-file">area51.lock</span>{"        "}<span className="tree-comment"># lockfile (auto-generated)</span>{"\n"}
              {"  "}<span className="tree-file">.gitignore</span>
            </code>
          </div>
          <ul className="docs-list">
            <li><strong>my-project.asd</strong> &mdash; ASDF system definition. Declares your project name, dependencies, and source files.</li>
            <li><strong>src/package.lisp</strong> &mdash; defines and exports your package symbols.</li>
            <li><strong>src/main.lisp</strong> &mdash; your application code starts here.</li>
            <li><strong>area51.lock</strong> &mdash; pinned dependency versions for reproducible builds. Commit this file.</li>
          </ul>
        </section>

        {/* Adding packages */}
        <section className="docs-section">
          <h2 className="docs-section-title">Adding Packages</h2>
          <p className="docs-text">
            Install packages from the gargantua registry with <code>area51 install</code>.
            Dependencies are resolved and locked automatically.
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>area51 install alexandria{"\n"}area51 install cl-json bordeaux-threads</code></pre>
          </div>
          <p className="docs-text">
            After installing, add the package to your system definition's <code>:depends-on</code> list:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">my-project.asd</span>
            <pre><code>{`(defsystem "my-project"
  :version "0.1.0"
  :author "Your Name"
  :license "MIT"
  :depends-on ("alexandria"
               "cl-json"
               "bordeaux-threads")
  :components ((:module "src"
                :components
                ((:file "package")
                 (:file "main")))))`}</code></pre>
          </div>
          <p className="docs-text">
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
          <h2 className="docs-section-title">Searching Packages</h2>
          <p className="docs-text">
            Find packages in the gargantua registry directly from your terminal.
            Search by name, keyword, or description.
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">Shell</span>
            <pre><code>{`area51 search json

  cl-json        1.0.2   JSON encoder/decoder
  jonathan       0.2.0   Fast JSON encoder/decoder
  jzon           1.1.3   Correct and safe JSON parser
  yason          0.9.0   JSON encoder/decoder`}</code></pre>
          </div>
          <p className="docs-text">
            You can also browse packages on the web at{" "}
            <a href="/packages">gargantua.dev/packages</a>.
          </p>
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
              {"  "}<span className="tree-file">config.lisp</span>{"      "}<span className="tree-comment"># user configuration</span>{"\n"}
              {"  "}<span className="tree-dir">cache/</span>{"            "}<span className="tree-comment"># downloaded packages</span>{"\n"}
              {"  "}<span className="tree-dir">systems/</span>{"          "}<span className="tree-comment"># symlinks for ASDF</span>
            </code>
          </div>
          <p className="docs-text">
            The <code>config.lisp</code> file lets you customize area51's behavior:
          </p>
          <div className="docs-code-block">
            <span className="docs-code-label">~/.area51/config.lisp</span>
            <pre><code>{`(:registry "https://gargantua.dev"
 :cache-dir "~/.area51/cache/"
 :default-license "MIT"
 :parallel-downloads 4
 :editor "emacs")`}</code></pre>
          </div>
          <ul className="docs-list">
            <li><strong>:registry</strong> &mdash; package registry URL. Defaults to gargantua.dev.</li>
            <li><strong>:cache-dir</strong> &mdash; where downloaded packages are stored locally.</li>
            <li><strong>:default-license</strong> &mdash; license used when running <code>area51 init</code>.</li>
            <li><strong>:parallel-downloads</strong> &mdash; concurrent downloads during install.</li>
            <li><strong>:editor</strong> &mdash; preferred editor for <code>area51 edit</code>.</li>
          </ul>
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
                  <td><code>area51 init &lt;name&gt;</code></td>
                  <td>Scaffold a new Common Lisp project</td>
                </tr>
                <tr>
                  <td><code>area51 install &lt;pkg...&gt;</code></td>
                  <td>Install one or more packages and update the lockfile</td>
                </tr>
                <tr>
                  <td><code>area51 remove &lt;pkg...&gt;</code></td>
                  <td>Remove packages from the project</td>
                </tr>
                <tr>
                  <td><code>area51 update [pkg]</code></td>
                  <td>Update all packages or a specific one to the latest version</td>
                </tr>
                <tr>
                  <td><code>area51 search &lt;query&gt;</code></td>
                  <td>Search the gargantua registry for packages</td>
                </tr>
                <tr>
                  <td><code>area51 info &lt;pkg&gt;</code></td>
                  <td>Show detailed information about a package</td>
                </tr>
                <tr>
                  <td><code>area51 list</code></td>
                  <td>List all installed packages in the current project</td>
                </tr>
                <tr>
                  <td><code>area51 test</code></td>
                  <td>Run the project test suite</td>
                </tr>
                <tr>
                  <td><code>area51 build</code></td>
                  <td>Build the project into a standalone binary</td>
                </tr>
                <tr>
                  <td><code>area51 publish</code></td>
                  <td>Publish the current project to the gargantua registry</td>
                </tr>
                <tr>
                  <td><code>area51 edit &lt;pkg&gt;</code></td>
                  <td>Open a package's source in your editor</td>
                </tr>
                <tr>
                  <td><code>area51 clean</code></td>
                  <td>Remove cached downloads and build artifacts</td>
                </tr>
                <tr>
                  <td><code>area51 --help</code></td>
                  <td>Show help for all commands or a specific command</td>
                </tr>
                <tr>
                  <td><code>area51 --version</code></td>
                  <td>Print the installed area51 version</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
