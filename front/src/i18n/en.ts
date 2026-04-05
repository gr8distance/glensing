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
    tagline: "Common Lisp Package Registry",
    search: "Search packages...",
    stats: (count: number) => `${count} packages in orbit`,
    what: {
      title: "What is gargantua?",
      desc: 'A package registry for Common Lisp. Packages orbit in gargantua\'s gravitational field, ready to be pulled into your local environment via <strong>area51</strong>.',
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
      addDesc: "Packages are fetched from <strong>gargantua</strong> and installed to your local machine.",
      how: "How it works",
      registry: "Registry (space)",
      local: "Your machine (earth)",
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
    emptyTitle: "No packages found in orbit",
    emptyHint: "Try a different search term or browse all packages",
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
      desc: "area51 is to Common Lisp what Bundler is to Ruby, Cargo to Rust, and npm to JavaScript. It resolves and manages your project dependencies, locking versions and ensuring reproducible builds across machines. Declare what you need and let area51 handle the rest \u2014 no Quicklisp required at runtime.",
    },
    how: "How it works",
    registry: "registry / space",
    local: "your machine",
    earth: "earth",
    installation: "Installation",
    commands: "Basic commands",
    cmd: {
      newDesc: "Scaffold a new project with area51.lisp and .asd.",
      addDesc: "Add a dependency to area51.lisp and .asd.",
      installDesc: "Resolve and download all dependencies.",
      buildDesc: "Build a binary, run the project, or execute tests.",
    },
    config: "Configuration",
    configDesc: "area51 stores its configuration and cache under",
    source: "Source",
    github: "View on GitHub",
  },

  // Docs page
  docs: {
    label: "Documentation",
    title: "Getting Started",
    subtitle: "Everything you need to start building Common Lisp projects with gargantua and the area51 package manager.",
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
    },
    browsing: {
      title: "Browsing Packages",
      text: "Browse and search packages on the web at",
      installed: "To see what's installed in your current project:",
    },
    configTitle: "Configuration",
    configText: "area51 stores its configuration and cache in your home directory.",
    configCache: "Packages are downloaded once and cached here. The Quicklisp index is refreshed automatically every 24 hours. Run <code>area51 clean</code> to clear the entire cache.",
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
      cleanDesc: "Clear the package cache (~/.area51/)",
      upgradeDesc: "Update area51 itself to the latest version",
    },
  },

  // PageLinks
  pageLinks: {
    explore: "Explore",
    more: "More",
    packages: { label: "Packages", desc: "Browse all packages in orbit" },
    area51: { label: "area51", desc: "The CL package manager" },
    docs: { label: "Docs", desc: "Getting started guide" },
    home: { label: "gargantua", desc: "Back to the black hole" },
  },
} as const;
