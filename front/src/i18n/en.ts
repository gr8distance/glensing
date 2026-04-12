export const en = {
  // Nav & Layout
  nav: {
    packages: "Packages",
    area51: "area51",
    docs: "Docs",
  },
  footer: {
    description: "Common Lisp Package Registry",
    powered: "Powered by",
  },
  langSwitch: "JP",

  // Top page
  top: {
    tagline: "Common Lisp Package Registry & Scope",
    search: "Search packages...",
    stats: (count: number) => `${count} packages in orbit`,
    what: {
      title: "What is Gravity Lensing?",
      desc: 'A package registry for Common Lisp. Browse and discover packages, then install them locally with <strong>area51</strong>.',
    },
    flow: {
      registry: "Package Registry",
    },
    quickstart: "Quick Start",
    packages: "Packages in Orbit",
    link: {
      area51: { desc: "The Common Lisp package manager" },
      docs: { label: "Documentation", desc: "Getting started guide" },
      packages: { label: "All Packages", desc: "Browse and search the registry" },
    },
    tooltip: {
      earth: "Earth \u2014 area51",
      earthDesc: "Click to explore the ground station",
    },
    pkg: {
      add: "Add to project",
      note: "Updates area51.lisp and .asd automatically.",
      install: "Install",
    },
    a51: {
      subtitle: "Common Lisp Package Manager",
      add: "Add a package",
      addDesc: "Packages are fetched from <strong>glensing</strong> and installed locally.",
      how: "How it works",
      registry: "Registry",
      local: "Your machine",
      quickstart: "Quick Start",
      config: "Config",
    },
    copy: "Copy",
    copied: "Copied!",
    commentInstall: "# Install area51",
    commentNew: "# Start a new project",
    commentAdd: "# Add packages",
    commentDownload: "# Download dependencies",
  },

  // Search results
  search: {
    placeholder: "Search packages...",
    count: (count: number) => `${count} package${count !== 1 ? "s" : ""} found`,
    resultsFor: (count: number, query: string) => `${count} result${count !== 1 ? "s" : ""} for "${query}"`,
    emptyTitle: (query: string) => `No packages found for "${query}"`,
    emptyHint: "Check your spelling, try broader keywords, or",
    emptyBrowse: (count: number) => `browse all ${count} packages`,
    sortRelevance: "Relevance",
    sortMostUsed: "Most used",
    sortNameAsc: "Name (A\u2192Z)",
    sortNameDesc: "Name (Z\u2192A)",
    usedBy: (count: number) => `Used by ${count}`,
  },

  // Package detail
  pkg: {
    usage: "Usage",
    deps: "Dependencies",
    usedBy: "Used by",
    links: "Links",
    source: "Source Repository",
    copyTooltip: "Click to copy",
    copy: "Copy",
    copied: "Copied!",
    usageComment1: ";; area51 add updates your .asd automatically.",
    usageComment2: ";; Use the package in your code:",
  },

  // area51 page
  a51: {
    subtitle: "Common Lisp Package Manager",
    what: {
      title: "What is area51?",
      desc: "area51 is a package manager for Common Lisp \u2014 like Bundler for Ruby, Cargo for Rust, or npm for JavaScript. It resolves dependencies, locks versions, and ensures reproducible builds. Declare what you need; area51 handles the rest.",
    },
    how: "How it works",
    registry: "registry",
    local: "your machine",
    installation: "Installation",
    commands: "Commands",
    cmd: {
      newDesc: "Create a new project with area51.lisp and .asd.",
      addDesc: "Add a dependency.",
      installDesc: "Resolve and download all dependencies.",
      buildDesc: "Build, run, or test your project.",
    },
    config: "Configuration",
    configDesc: "area51 stores its cache under",
    treeDownloaded: "downloaded packages",
    treeCachedIndex: "cached Quicklisp index",
    source: "Source",
    github: "View on GitHub",
  },

  // Docs page
  docs: {
    label: "Documentation",
    title: "Getting Started",
    subtitle: "Everything you need to start building Common Lisp projects with glensing and the area51 package manager.",
    prerequisites: {
      title: "Prerequisites",
      text: "Before installing area51, you need a working Common Lisp implementation. We recommend <strong>SBCL</strong> (Steel Bank Common Lisp) for its performance and wide compatibility, but any conforming implementation will work.",
      sbcl: "recommended, available on most platforms",
      ccl: "good alternative with native threads",
      ecl: "compiles to C, ideal for embedding",
      abcl: "runs on the JVM",
      verify: "Verify your installation by running:",
    },
    install: {
      title: "Install area51",
      text: "area51 is a single binary with no runtime dependencies. Install it with one command:",
      path: 'This installs the <code>area51</code> binary to <code>~/.local/bin</code>. Make sure it is on your <code>PATH</code>. You can verify the installation:',
    },
    create: {
      title: "Create a Project",
      text: "Scaffold a new Common Lisp project with <code>area51 new</code>. This generates a standard project structure ready for development.",
      structure: "The generated structure:",
      manifest: "project manifest",
      asd: "ASDF system definition",
      packageLisp: "package definition",
      mainLisp: "entry point",
      items: {
        area51Lisp: "project manifest. Declares dependencies and metadata.",
        asd: "ASDF system definition. Auto-updated by <code>area51 add</code> / <code>remove</code>.",
        packageLisp: "defines and exports your package symbols.",
        mainLisp: "your application code starts here.",
      },
    },
    adding: {
      title: "Adding Packages",
      text: "Add packages with <code>area51 add</code>. This updates both your <code>area51.lisp</code> manifest and <code>.asd</code> system definition automatically.",
      install: "Then run <code>area51 install</code> to resolve and download all dependencies:",
      lock: "This generates an <code>area51.lock</code> file pinning exact versions for reproducible builds. Now you can use the packages in your source files:",
      packageLispNote: "<code>area51 add</code> updates <code>area51.lisp</code> and your <code>.asd</code> file, but it intentionally does <strong>not</strong> touch <code>src/package.lisp</code>. How you bring symbols into your package is a taste call, so area51 leaves it to you. You have a few idiomatic options:",
      importFromHeading: "import-from",
      importFromDesc: "Explicit, the most common style in modern Common Lisp code. Anyone reading your code can tell at a glance where every non-CL symbol came from.",
      localNicknamesHeading: "local-nicknames",
      localNicknamesDesc: "Keep symbols qualified, but avoid typing the full package name on every call.",
      useHeading: "use",
      useDesc: "Pulls every exported symbol in. Natural for DSL-ish libraries whose symbols read as syntax (<code>arrows</code>, <code>iterate</code>), but generally avoided for large utility libraries like alexandria where silent symbol conflicts can creep in as the library grows.",
      qualifiedDesc: "Or skip <code>package.lisp</code> entirely and use fully-qualified symbols in your code: <code>(alexandria:iota 5)</code>.",
    },
    sly: {
      title: "Interactive Development with SLY/SLIME",
      text: "<code>area51 repl</code> starts a <a href=\"https://github.com/joaotavora/sly\" target=\"_blank\" rel=\"noreferrer\">slynk</a> server with your project already loaded and <code>*package*</code> dropped into the project package. Connect from Emacs with <code>M-x sly-connect</code> and you get a REPL scoped to the project — no <code>.sbclrc</code> or <code>.dir-locals.el</code> setup needed on the Emacs side.",
      startText: "Start the REPL server from your project directory:",
      connectText: "Then in Emacs:",
      connectCmd: "M-x sly-connect RET 127.0.0.1 RET 4005 RET",
      features: "The REPL opens in your project's package, so you can immediately call <code>(main)</code> or any other exported function without qualifying.",
      portItem: "<code>--port N</code> picks a different port if 4005 is taken.",
      stopItem: "<strong>Ctrl-C</strong> in the area51 terminal shuts down cleanly and releases the port, so an immediate restart just works.",
      isolationItem: "<strong>Per-project isolation</strong>: only dependencies listed in this project's <code>area51.lock</code> are visible to ASDF in the running sbcl, matching the isolation of <code>area51 run</code>.",
      slynkNote: "Slynk is loaded via ASDF at startup. If it is not already findable on your machine (SLY ships it; <code>(ql:quickload :slynk)</code> also works), you will see a one-line error instead of a hang.",
    },
    browsing: {
      title: "Browsing Packages",
      text: "Browse and search packages on the web at",
      installed: "To see what's installed in your current project:",
    },
    configTitle: "Configuration",
    configText: "area51 stores its configuration and cache in your home directory.",
    configCache: "Packages are downloaded once and cached here. The Quicklisp index is refreshed automatically every 24 hours. Run <code>area51 clean</code> to clear the entire cache.",
    treeDownloaded: "downloaded packages",
    treeCachedIndex: "cached Quicklisp index",
    commands: {
      title: "Commands Reference",
      text: "All available area51 commands at a glance.",
      command: "Command",
      description: "Description",
      newDesc: "Scaffold a new Common Lisp project",
      addDesc: "Add a dependency to area51.lisp and .asd",
      removeDesc: "Remove a dependency from the project",
      installDesc: "Resolve and download all dependencies, generate lockfile",
      listDesc: "List declared dependencies and their status",
      buildDesc: "Build the project into a standalone binary",
      runDesc: "Load and run the project's entry point",
      testDesc: "Run the project test suite",
      replDesc: "Start a slynk server for SLY/SLIME to connect to",
      cleanDesc: "Clear the package cache (~/.area51/)",
      upgradeDesc: "Update area51 itself to the latest version",
    },
  },

  // About page
  about: {
    label: "About",
    title: "About Gravity Lensing",
    subtitle: "A package registry and ecosystem for Common Lisp.",
    whatGargantua: {
      title: "What is Gravity Lensing?",
      desc: "Gravity Lensing is a package registry for Common Lisp. It indexes packages from the Quicklisp ecosystem and presents them in a searchable, browsable interface. Think of it as the central hub where Common Lisp libraries orbit, ready to be discovered and pulled into your projects.",
    },
    whatArea51: {
      title: "What is area51?",
      desc: "area51 is a command-line package manager for Common Lisp. It resolves dependencies, locks versions, and manages your project's packages locally. If Gravity Lensing is the registry in the sky, area51 is the ground station on your machine.",
    },
    relationship: {
      title: "How they work together",
      desc: "Gravity Lensing hosts and indexes packages. area51 queries Gravity Lensing to find, download, and manage them on your machine. You search and browse on Gravity Lensing; you install and build with area51.",
      registry: "Package Registry",
      cli: "CLI Package Manager",
      browse: "Browse & search",
      install: "Install & manage",
    },
    name: {
      title: "Why \"Gravity Lensing\"?",
      desc: "The name comes from gravitational lensing \u2014 a black hole's gravity bends light to reveal what lies beyond. Many of today's programming languages have been influenced by Lisp. Lisp is gravity itself. The brilliant libraries created by the great Lisp Aliens orbit within Lisp's gravitational field. We named it Gravity Lensing so you can find Common Lisp packages through the lens of that gravity.",
    },
    openSource: {
      title: "Open source",
      desc: "Both Gravity Lensing and area51 are open source. Package data is sourced from Quicklisp. Contributions are welcome.",
    },
    gargantuaRepo: "glensing on GitHub",
    area51Repo: "area51 on GitHub",
  },

  // FAQ page
  faq: {
    label: "FAQ",
    title: "Frequently Asked Questions",
    subtitle: "Common questions about glensing and area51.",
    items: [
      {
        q: "What is glensing?",
        a: "Gravity Lensing is a package registry for Common Lisp. It provides a searchable web interface for discovering Common Lisp libraries, with package details, dependencies, and usage information.",
      },
      {
        q: "What is area51?",
        a: "area51 is a package manager CLI for Common Lisp. It handles dependency resolution, version locking, and reproducible builds for your projects.",
      },
      {
        q: "How do I install area51?",
        a: "Run the following command in your terminal:\ncurl -fsSL https://raw.githubusercontent.com/gr8distance/area51/main/install.sh | bash",
      },
      {
        q: "How do I add a package?",
        a: "Use the add command:\narea51 add <package-name>\nThis updates both your area51.lisp manifest and .asd system definition automatically.",
      },
      {
        q: "Where are packages stored?",
        a: "Downloaded packages are cached in ~/.area51/packages/. The Quicklisp index is cached in ~/.area51/quicklisp/ and refreshed every 24 hours.",
      },
      {
        q: "Is Quicklisp required?",
        a: "No. area51 is a standalone package manager. It fetches package metadata from glensing and downloads sources directly. You do not need Quicklisp installed.",
      },
      {
        q: "How do I publish a package?",
        a: "Package publishing is coming soon. Currently, glensing indexes packages from the Quicklisp distribution. Stay tuned for direct publishing support.",
      },
      {
        q: "Is glensing free?",
        a: "Yes. Both Gravity Lensing and area51 are free and open source software.",
      },
    ],
  },

  // PageLinks
  pageLinks: {
    explore: "Explore",
    more: "More",
    packages: { label: "Packages", desc: "Browse all packages in orbit" },
    area51: { label: "area51", desc: "The CL package manager" },
    docs: { label: "Docs", desc: "Getting started guide" },
    home: { label: "Gravity Lensing", desc: "Back to the black hole" },
  },
} as const;
