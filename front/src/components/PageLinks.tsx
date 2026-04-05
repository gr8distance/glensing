import { useTranslations, localePath, type Locale } from "../i18n";

interface LinkItem {
  href: string;
  label: string;
  desc: string;
}

interface Props {
  links: LinkItem[];
  title?: string;
  locale?: Locale;
}

export function PageLinks({ links, title, locale = "en" }: Props) {
  const t = useTranslations(locale);
  const displayTitle = title ?? t.pageLinks.explore;

  return (
    <nav className="page-links">
      <h3 className="page-links-title">{displayTitle}</h3>
      <div className="page-links-grid">
        {links.map((link) => (
          <a key={link.href} href={localePath(locale, link.href)} className="page-link-card">
            <span className="page-link-label">{link.label}</span>
            <span className="page-link-desc">{link.desc}</span>
            <span className="page-link-arrow">&rarr;</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export function getLinks(locale: Locale = "en") {
  const t = useTranslations(locale);
  return {
    LINK_PACKAGES: { href: "/packages", label: t.pageLinks.packages.label, desc: t.pageLinks.packages.desc },
    LINK_AREA51: { href: "/area51", label: t.pageLinks.area51.label, desc: t.pageLinks.area51.desc },
    LINK_DOCS: { href: "/docs", label: t.pageLinks.docs.label, desc: t.pageLinks.docs.desc },
    LINK_HOME: { href: "/", label: t.pageLinks.home.label, desc: t.pageLinks.home.desc },
  };
}

// Keep backwards-compatible exports for default (en) locale
const enLinks = getLinks("en");
export const LINK_PACKAGES = enLinks.LINK_PACKAGES;
export const LINK_AREA51 = enLinks.LINK_AREA51;
export const LINK_DOCS = enLinks.LINK_DOCS;
export const LINK_HOME = enLinks.LINK_HOME;
