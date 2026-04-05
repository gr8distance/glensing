interface LinkItem {
  href: string;
  label: string;
  desc: string;
}

interface Props {
  links: LinkItem[];
  title?: string;
}

export function PageLinks({ links, title = "Explore" }: Props) {
  return (
    <nav className="page-links">
      <h3 className="page-links-title">{title}</h3>
      <div className="page-links-grid">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="page-link-card">
            <span className="page-link-label">{link.label}</span>
            <span className="page-link-desc">{link.desc}</span>
            <span className="page-link-arrow">&rarr;</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export const LINK_PACKAGES = { href: "/packages", label: "Packages", desc: "Browse all packages in orbit" };
export const LINK_AREA51 = { href: "/area51", label: "area51", desc: "The CL package manager" };
export const LINK_DOCS = { href: "/docs", label: "Docs", desc: "Getting started guide" };
export const LINK_HOME = { href: "/", label: "gargantua", desc: "Back to the black hole" };
