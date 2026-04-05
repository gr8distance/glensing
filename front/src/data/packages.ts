export interface Package {
  name: string;
  desc: string;
  repo?: string;
  license?: string;
  deps?: string[];
  reverseDeps?: string[];
  version?: string;
}

// Static package data (will be replaced with D1 when publish is implemented)
export const PACKAGES: Package[] = [
  { name: "alexandria", desc: "A collection of portable public-domain utilities", repo: "https://gitlab.common-lisp.net/alexandria/alexandria", license: "Public Domain", version: "1.4", deps: [], reverseDeps: ["serapeum", "lack", "ningle", "mito"] },
  { name: "cl-ppcre", desc: "Portable Perl-compatible regular expressions", repo: "https://github.com/edicl/cl-ppcre", license: "BSD-2", version: "2.1.2", deps: [], reverseDeps: ["hunchentoot", "ningle"] },
  { name: "bordeaux-threads", desc: "Portable multithreading primitives", repo: "https://github.com/sionescu/bordeaux-threads", license: "MIT", version: "0.9.4", deps: [], reverseDeps: ["lparallel", "usocket", "hunchentoot"] },
  { name: "usocket", desc: "Universal socket library", repo: "https://github.com/usocket/usocket", license: "MIT", version: "0.8.7", deps: ["bordeaux-threads"], reverseDeps: ["dexador", "hunchentoot"] },
  { name: "dexador", desc: "Fast HTTP client", repo: "https://github.com/fukamachi/dexador", license: "MIT", version: "0.9.15", deps: ["usocket", "bordeaux-threads", "cl-ppcre"], reverseDeps: [] },
  { name: "jonathan", desc: "High-performance JSON encoder/decoder", repo: "https://github.com/Rudolph-Miller/jonathan", license: "MIT", version: "0.1.0", deps: ["cl-ppcre"], reverseDeps: ["ningle"] },
  { name: "lack", desc: "Minimal Clack-compatible web application interface", repo: "https://github.com/fukamachi/lack", license: "MIT", version: "0.2.0", deps: ["alexandria", "bordeaux-threads"], reverseDeps: ["ningle"] },
  { name: "ningle", desc: "Lightweight web framework", repo: "https://github.com/fukamachi/ningle", license: "MIT", version: "0.3.0", deps: ["lack", "alexandria", "cl-ppcre"], reverseDeps: [] },
  { name: "sxql", desc: "SQL generator from S-expressions", repo: "https://github.com/fukamachi/sxql", license: "BSD-3", version: "0.1.0", deps: ["alexandria"], reverseDeps: ["mito"] },
  { name: "mito", desc: "ORM with migration support", repo: "https://github.com/fukamachi/mito", license: "MIT", version: "0.2.0", deps: ["sxql", "alexandria", "closer-mop"], reverseDeps: [] },
  { name: "cl-async", desc: "Asynchronous I/O library", repo: "https://github.com/orthecreedence/cl-async", license: "MIT", version: "0.6.1", deps: ["bordeaux-threads", "cffi"], reverseDeps: [] },
  { name: "ironclad", desc: "Cryptographic toolkit", repo: "https://github.com/sharplispers/ironclad", license: "MIT", version: "0.59", deps: ["bordeaux-threads"], reverseDeps: [] },
  { name: "lparallel", desc: "Parallel programming library", repo: "https://github.com/lmj/lparallel", license: "BSD-3", version: "2.8.4", deps: ["bordeaux-threads", "alexandria"], reverseDeps: [] },
  { name: "trivia", desc: "Pattern matching for Common Lisp", repo: "https://github.com/guicho271828/trivia", license: "MIT", version: "0.0.1", deps: ["alexandria"], reverseDeps: [] },
  { name: "str", desc: "Modern string manipulation library", repo: "https://github.com/vindarel/cl-str", license: "MIT", version: "0.19", deps: ["cl-ppcre"], reverseDeps: [] },
  { name: "log4cl", desc: "Logging framework", repo: "https://github.com/sharplispers/log4cl", license: "Apache-2.0", version: "1.1.4", deps: ["bordeaux-threads"], reverseDeps: [] },
  { name: "fiveam", desc: "Regression testing framework", repo: "https://github.com/lispci/fiveam", license: "BSD", version: "1.4.2", deps: ["alexandria"], reverseDeps: [] },
  { name: "parachute", desc: "Extensible testing framework", repo: "https://github.com/Shinmera/parachute", license: "zlib", version: "1.5.0", deps: [], reverseDeps: [] },
  { name: "arrows", desc: "Threading macro implementations", repo: "https://github.com/Harleqin/arrows", license: "CC0", version: "0.2.0", deps: [], reverseDeps: [] },
  { name: "serapeum", desc: "Utilities beyond Alexandria", repo: "https://github.com/ruricolist/serapeum", license: "MIT", version: "0.0.1", deps: ["alexandria", "bordeaux-threads"], reverseDeps: [] },
  { name: "cl-json", desc: "JSON encoder/decoder", repo: "https://github.com/sharplispers/cl-json", license: "MIT", version: "0.7.0", deps: [], reverseDeps: [] },
  { name: "hunchentoot", desc: "Web server written in Common Lisp", repo: "https://github.com/edicl/hunchentoot", license: "BSD-2", version: "1.3.0", deps: ["usocket", "bordeaux-threads", "cl-ppcre"], reverseDeps: ["ningle"] },
  { name: "closer-mop", desc: "Cross-implementation MOP compatibility", repo: "https://github.com/pcostanza/closer-mop", license: "MIT", version: "1.0.0", deps: [], reverseDeps: ["mito"] },
  { name: "cffi", desc: "C foreign function interface", repo: "https://github.com/cffi/cffi", license: "MIT", version: "0.24.1", deps: ["bordeaux-threads", "alexandria"], reverseDeps: ["cl-async"] },
  { name: "flexi-streams", desc: "Flexible bivalent streams", repo: "https://github.com/edicl/flexi-streams", license: "BSD-2", version: "1.0.19", deps: [], reverseDeps: ["hunchentoot", "dexador"] },
];

export function findPackage(name: string): Package | undefined {
  return PACKAGES.find((p) => p.name === name);
}

export function searchPackages(query: string): Package[] {
  const q = query.toLowerCase();
  return PACKAGES.filter(
    (p) => p.name.includes(q) || p.desc.toLowerCase().includes(q)
  );
}
