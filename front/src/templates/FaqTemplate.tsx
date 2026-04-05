import { useState } from "react";
import { PageLinks, getLinks } from "../components/PageLinks";
import { useTranslations, type Locale } from "../i18n";
import "./FaqTemplate.css";

interface Props {
  locale?: Locale;
}

export function FaqTemplate({ locale = "en" }: Props) {
  const t = useTranslations(locale);
  const links = getLinks(locale);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <main className="faq-page">
      <div className="container">

        {/* Hero */}
        <header className="faq-hero">
          <p className="faq-hero-label">{t.faq.label}</p>
          <h1 className="faq-hero-title">{t.faq.title}</h1>
          <p className="faq-hero-sub">{t.faq.subtitle}</p>
        </header>

        {/* FAQ items */}
        <section className="faq-list">
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? "faq-item--open" : ""}`}
            >
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span className="faq-question-text">{item.q}</span>
                <span className="faq-chevron">{openIndex === i ? "\u2212" : "+"}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  {item.a.split("\n").map((line, j) =>
                    line.startsWith("area51 ") || line.startsWith("curl ") ? (
                      <pre key={j}><code>{line}</code></pre>
                    ) : (
                      <p key={j}>{line}</p>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        <PageLinks links={[links.LINK_PACKAGES, links.LINK_AREA51, links.LINK_DOCS, links.LINK_HOME]} locale={locale} />
      </div>
    </main>
  );
}
