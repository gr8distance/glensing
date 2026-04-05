import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import type { Package } from "../data/packages";
import { initScene, type SceneAPI } from "../components/BlackHoleScene";
import { useTranslations, localePath, type Locale } from "../i18n";
import "./TopPageTemplate.css";

const ORBIT_COUNT = 180;

function pickRandom(allPkgs: Package[], count: number): Package[] {
  const withDesc = allPkgs.filter((p) => p.desc);
  const withoutDesc = allPkgs.filter((p) => !p.desc);
  // Always include described packages, fill rest randomly
  const shuffled = [...withoutDesc].sort(() => Math.random() - 0.5);
  return [...withDesc, ...shuffled].slice(0, count);
}

interface Props {
  packages: Package[];
  locale?: Locale;
}

export function TopPageTemplate({ packages: allPackages, locale = "en" }: Props) {
  const packages = useMemo(() => pickRandom(allPackages, ORBIT_COUNT), []);
  const t = useTranslations(locale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneAPIRef = useRef<SceneAPI | null>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const area51Ref = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const installLogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tooltip, setTooltip] = useState<{ name: string; desc: string; x: number; y: number } | null>(null);
  const [pkgDetail, setPkgDetail] = useState<{ index: number; pkg: Package } | null>(null);
  const [area51DetailVisible, setArea51DetailVisible] = useState(false);
  const [overlayFaded, setOverlayFaded] = useState(false);
  const [installLog, setInstallLog] = useState("");
  const [installLogOpacity, setInstallLogOpacity] = useState(0);
  const [area51PulseActive, setArea51PulseActive] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Package & { index: number })[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Label positions updated via RAF
  const [labelPositions, setLabelPositions] = useState<({ x: number; y: number; visible: boolean } | null)[]>([]);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [labelsOpacity, setLabelsOpacity] = useState(1);
  const [searchMatchIndices, setSearchMatchIndices] = useState(new Set<number>());

  // Copy button handler
  const handleCopy = useCallback((text: string, btn: HTMLButtonElement) => {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = t.top.copied;
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = t.top.copy; btn.classList.remove("copied"); }, 1500);
    });
  }, [t]);

  // Add copy buttons to pre elements
  useEffect(() => {
    const addCopyButtons = () => {
      document.querySelectorAll<HTMLPreElement>(".top-pkg-detail pre, .top-area51-detail pre, .code-block pre").forEach((pre) => {
        if (pre.querySelector(".copy-btn")) return;
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.textContent = t.top.copy;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const code = pre.querySelector("code")?.textContent || pre.textContent || "";
          handleCopy(code, btn);
        });
        pre.style.position = "relative";
        pre.appendChild(btn);
      });
    };
    const observer = new MutationObserver(addCopyButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    addCopyButtons();
    return () => observer.disconnect();
  }, [handleCopy, t]);

  // Scene initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pkgData = packages.map((p) => ({ name: p.name, desc: p.desc }));

    const { cleanup, api } = initScene(canvas, pkgData, {
      onHoverPackage(pkg, x, y) {
        if (pkg) {
          setTooltip({ name: pkg.name, desc: pkg.desc, x: x + 16, y: y - 8 });
        } else {
          setTooltip(null);
        }
      },
      onHoverEarth(hovered, x, y) {
        if (hovered) {
          setTooltip({ name: t.top.tooltip.earth, desc: t.top.tooltip.earthDesc, x: x + 16, y: y - 8 });
        } else {
          setTooltip(null);
        }
      },
      onClickPackage(index, _pkg) {
        zoomToPackage(index);
      },
      onClickEarth() {
        zoomToEarth();
      },
      onClickBackground() {
        // Scene handles mode transitions internally
      },
      onInstallLog(message, done) {
        setInstallLog(message);
        setInstallLogOpacity(1);
        if (done) {
          if (installLogTimerRef.current) clearTimeout(installLogTimerRef.current);
          installLogTimerRef.current = setTimeout(() => setInstallLogOpacity(0), 2000);
        }
      },
      onPulseArea51(active) {
        setArea51PulseActive(active);
      },
    });

    sceneAPIRef.current = api;

    // Label update loop
    let labelRAF: number;
    const updateLabels = () => {
      labelRAF = requestAnimationFrame(updateLabels);
      const mode = api.getCameraMode();
      const scrollProg = getScrollProgress();

      if (scrollProg < 0.5 && mode !== "zoom-pkg") {
        setLabelsVisible(true);
        setLabelsOpacity(Math.max(1 - scrollProg * 3, 0));

        const positions: ({ x: number; y: number; visible: boolean } | null)[] = [];
        for (let i = 0; i < api.getPkgCount(); i++) {
          const pos = api.getPackageScreenPos(i);
          if (pos) {
            positions.push({ x: pos.x + 28, y: pos.y - 7, visible: true });
          } else {
            positions.push(null);
          }
        }
        setLabelPositions(positions);
      } else if (mode !== "zoom-pkg") {
        setLabelsVisible(false);
      }
    };
    labelRAF = requestAnimationFrame(updateLabels);

    // Scroll handler
    const handleScroll = () => {
      const progress = getScrollProgress();
      api.setScrollProgress(progress);

      const heroOpacity = Math.max(1 - progress * 2, 0);
      if (overlayRef.current) overlayRef.current.style.opacity = String(heroOpacity);
      if (area51Ref.current) area51Ref.current.style.opacity = String(heroOpacity);
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = String(Math.max(1 - progress * 4, 0));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cleanup();
      cancelAnimationFrame(labelRAF);
      window.removeEventListener("scroll", handleScroll);
      if (installLogTimerRef.current) clearTimeout(installLogTimerRef.current);
    };
  }, [packages]);

  // Sync search matches to scene
  useEffect(() => {
    sceneAPIRef.current?.setSearchMatches(searchMatchIndices);
  }, [searchMatchIndices]);

  function getScrollProgress(): number {
    return Math.min(window.scrollY / window.innerHeight, 1);
  }

  function zoomToPackage(index: number) {
    const api = sceneAPIRef.current;
    if (!api || api.getCameraMode() === "zoom-pkg") return;

    api.zoomToPackage(index);
    setPkgDetail({ index, pkg: packages[index] });
    setOverlayFaded(true);
    setLabelsOpacity(0);
  }

  function closePackageDetail() {
    const api = sceneAPIRef.current;
    if (!api) return;
    api.closePackageDetail();
    setPkgDetail(null);
    setOverlayFaded(false);
    setLabelsOpacity(1);
  }

  function zoomToEarth() {
    const api = sceneAPIRef.current;
    if (!api || api.getCameraMode() === "zoom-earth") return;
    api.zoomToEarth();
    setArea51DetailVisible(true);
    setOverlayFaded(true);
  }

  function returnHome() {
    const api = sceneAPIRef.current;
    if (!api) return;
    api.returnHome();
    setArea51DetailVisible(false);
    setOverlayFaded(false);
  }

  function closeAnyModal() {
    if (pkgDetail) closePackageDetail();
    if (area51DetailVisible) returnHome();
  }

  // Esc to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAnyModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pkgDetail, area51DetailVisible]);

  // Search
  function handleSearch(value: string) {
    setSearchQuery(value);
    const q = value.trim().toLowerCase();

    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchMatchIndices(new Set());
      return;
    }

    const matches: (Package & { index: number })[] = [];
    const indices = new Set<number>();
    packages.forEach((p, i) => {
      if (p.name.includes(q) || p.desc.toLowerCase().includes(q)) {
        matches.push({ ...p, index: i });
        indices.add(i);
      }
    });

    setSearchResults(matches);
    setSearchOpen(matches.length > 0);
    setSearchMatchIndices(indices);
  }

  function handleSearchBlur() {
    setTimeout(() => {
      setSearchOpen(false);
      setSearchMatchIndices(new Set());
    }, 200);
  }

  function handleSearchResultClick(index: number) {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setSearchMatchIndices(new Set());
    zoomToPackage(index);
  }

  function handlePackageCardClick(index: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const waitForScroll = () => {
      if (window.scrollY < 10) {
        setTimeout(() => zoomToPackage(index), 300);
      } else {
        requestAnimationFrame(waitForScroll);
      }
    };
    requestAnimationFrame(waitForScroll);
  }

  return (
    <>
      <canvas ref={canvasRef} className="top-canvas" />

      {/* Hero overlay */}
      <div ref={overlayRef} className={`top-overlay${overlayFaded ? " faded" : ""}`}>
        <div className="top-title">
          <h1>gargantua</h1>
          <p className="top-tagline">{t.top.tagline}</p>
        </div>

        <div className="top-search-box">
          <input
            type="text"
            className="top-search-input"
            placeholder={t.top.search}
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={handleSearchBlur}
          />
          <div className={`top-results${searchOpen ? " open" : ""}`}>
            {searchResults.map((p) => (
              <div
                key={p.name}
                className="result-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSearchResultClick(p.index);
                }}
              >
                <div className="name">{p.name}</div>
                <div className="desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="top-stats">
          <span>{t.top.stats(allPackages.length)}</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollHintRef} className="top-scroll-hint">
        <span className="scroll-arrow">&darr;</span>
      </div>

      {/* area51 ground station HUD */}
      <div ref={area51Ref} className="top-area51">
        <div className={`area51-pulse${area51PulseActive ? " active" : ""}`} />
        <div className="area51-label">
          <span className="a51-icon">&#9651;</span>
          <span className="a51-name">area51</span>
          <span className="a51-path">~/.area51/packages/</span>
        </div>
        <div className="top-install-log" style={{ opacity: installLogOpacity }}>
          {installLog}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="top-content">
        <section>
          <div className="section-inner">
            <h2>{t.top.what.title}</h2>
            <p dangerouslySetInnerHTML={{ __html: t.top.what.desc }} />

            <div className="flow-diagram">
              <div className="flow-node">
                <span className="flow-icon bh">&#9679;</span>
                <div>
                  <div className="flow-title">gargantua</div>
                  <div className="flow-desc">{t.top.flow.registry}</div>
                </div>
              </div>
              <div className="flow-arrow">&darr; <code>area51 add / install</code></div>
              <div className="flow-node">
                <span className="flow-icon earth">&#9679;</span>
                <div>
                  <div className="flow-title">area51</div>
                  <div className="flow-desc">~/.area51/packages/</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-inner">
            <h2>{t.top.quickstart}</h2>
            <div className="code-block">
              <pre><code><span className="c-comment">{t.top.commentInstall}</span>{"\n"}$ curl -fsSL https://gargantua.space/install.sh | sh{"\n"}{"\n"}<span className="c-comment">{t.top.commentNew}</span>{"\n"}$ area51 new my-project{"\n"}{"\n"}<span className="c-comment">{t.top.commentAdd}</span>{"\n"}$ area51 add alexandria cl-ppcre dexador{"\n"}{"\n"}<span className="c-comment">{t.top.commentDownload}</span>{"\n"}$ area51 install</code></pre>
            </div>
          </div>
        </section>

        <section>
          <div className="section-inner">
            <h2>{t.top.packages}</h2>
            <div className="top-package-grid">
              {packages.map((p, i) => (
                <div
                  key={p.name}
                  className="pkg-card"
                  onClick={() => handlePackageCardClick(i)}
                >
                  <div className="pkg-name">{p.name}</div>
                  <div className="pkg-desc">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="top-explore">
          <div className="section-inner">
            <div className="page-links-grid" style={{maxWidth: 700, margin: "0 auto"}}>
              <a href={localePath(locale, "/area51")} className="page-link-card">
                <span className="page-link-label">area51</span>
                <span className="page-link-desc">{t.top.link.area51.desc}</span>
                <span className="page-link-arrow">&rarr;</span>
              </a>
              <a href={localePath(locale, "/docs")} className="page-link-card">
                <span className="page-link-label">{t.top.link.docs.label}</span>
                <span className="page-link-desc">{t.top.link.docs.desc}</span>
                <span className="page-link-arrow">&rarr;</span>
              </a>
              <a href={localePath(locale, "/packages")} className="page-link-card">
                <span className="page-link-label">{t.top.link.packages.label}</span>
                <span className="page-link-desc">{t.top.link.packages.desc}</span>
                <span className="page-link-arrow">&rarr;</span>
              </a>
            </div>
          </div>
        </section>

        <footer className="top-footer">
          <p>gargantua &mdash; {t.top.tagline}</p>
          <p className="footer-sub">{t.footer.powered} <a href={localePath(locale, "/area51")}>area51</a></p>
        </footer>
      </div>

      {/* Tooltip */}
      <div
        className={`top-tooltip${tooltip ? "" : " hidden"}`}
        style={tooltip ? { left: tooltip.x, top: tooltip.y } : {}}
      >
        {tooltip && (
          <>
            <div className="tt-name">{tooltip.name}</div>
            <div className="tt-desc">{tooltip.desc}</div>
          </>
        )}
      </div>

      {/* Package labels */}
      <div
        ref={labelsRef}
        className="top-pkg-labels"
        style={{
          display: labelsVisible ? "" : "none",
          opacity: labelsOpacity,
        }}
      >
        {packages.map((p, i) => {
          const pos = labelPositions[i];
          if (!pos) return null;

          const isMatch = searchMatchIndices.has(i);
          const isSearchActive = searchMatchIndices.size > 0;

          const style: React.CSSProperties = {
            transform: `translate(${pos.x}px, ${pos.y}px)`,
          };

          if (isSearchActive) {
            if (isMatch) {
              style.color = "rgba(80, 255, 150, 0.95)";
              style.fontSize = "0.8rem";
              style.textShadow = "0 0 8px rgba(80, 255, 150, 0.5)";
            } else {
              style.color = "rgba(200, 180, 255, 0.12)";
              style.fontSize = "0.6rem";
              style.textShadow = "none";
            }
          }

          return (
            <div
              key={p.name}
              className="pkg-label"
              style={style}
              onClick={(e) => {
                e.stopPropagation();
                zoomToPackage(i);
              }}
            >
              {p.name}
            </div>
          );
        })}
      </div>

      {/* Modal backdrop */}
      {(pkgDetail || area51DetailVisible) && (
        <div className="top-modal-backdrop" onClick={closeAnyModal} />
      )}

      {/* Package detail overlay */}
      <div className={`top-pkg-detail${pkgDetail ? " visible" : ""}`}>
        <button
          className="top-pkg-detail-close"
          onClick={(e) => {
            e.stopPropagation();
            closePackageDetail();
          }}
        >
          &times;
        </button>
        {pkgDetail && (
          <div>
            <h2>{pkgDetail.pkg.name}</h2>
            <p className="pd-desc">{pkgDetail.pkg.desc}</p>
            <div className="pd-section">
              <h3>{t.top.pkg.add}</h3>
              <pre><code>$ area51 add {pkgDetail.pkg.name}</code></pre>
              <p className="pd-note">{t.top.pkg.note}</p>
            </div>
            <div className="pd-section">
              <h3>{t.top.pkg.install}</h3>
              <pre><code>$ area51 install</code></pre>
            </div>
          </div>
        )}
      </div>

      {/* area51 detail overlay */}
      <div className={`top-area51-detail${area51DetailVisible ? " visible" : ""}`}>
        <button
          className="top-area51-close"
          onClick={(e) => {
            e.stopPropagation();
            returnHome();
          }}
        >
          &times;
        </button>
        <h2>area51</h2>
        <p className="a51-subtitle">{t.top.a51.subtitle}</p>

        <div className="a51-section">
          <h3>{t.top.a51.add}</h3>
          <pre><code>$ area51 add alexandria</code></pre>
          <p dangerouslySetInnerHTML={{ __html: t.top.a51.addDesc }} />
        </div>

        <div className="a51-section">
          <h3>{t.top.a51.how}</h3>
          <div className="a51-flow">
            <div className="a51-node">
              <span className="a51-node-icon">&#9679;</span>
              <span>gargantua</span>
              <span className="a51-node-desc">{t.top.a51.registry}</span>
            </div>
            <div className="a51-arrow">&darr;</div>
            <div className="a51-node">
              <span className="a51-node-icon">&#9651;</span>
              <span>area51</span>
              <span className="a51-node-desc">{t.top.a51.local}</span>
            </div>
          </div>
        </div>

        <div className="a51-section">
          <h3>{t.top.a51.quickstart}</h3>
          <pre><code>{`$ curl -fsSL https://gargantua.space/install.sh | sh\n$ area51 new my-project\n$ area51 add cl-ppcre dexador\n$ area51 install`}</code></pre>
        </div>

        <div className="a51-section">
          <h3>{t.top.a51.config}</h3>
          <pre><code>{`~/.area51/\n  \u251C\u2500\u2500 packages/      # downloaded packages\n  \u2514\u2500\u2500 quicklisp/     # cached index`}</code></pre>
        </div>
      </div>
    </>
  );
}
