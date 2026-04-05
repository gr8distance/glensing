import { localePath, type Locale } from "../i18n";

interface Props {
  title: string;
  deps: string[];
  locale?: Locale;
}

export function DependencyList({ title, deps, locale = "en" }: Props) {
  if (!deps.length) return null;

  return (
    <div className="dep-list">
      <h3 className="dep-list-title">{title}</h3>
      <div className="dep-list-items">
        {deps.map((name) => (
          <a key={name} href={localePath(locale, `/packages/${name}`)} className="dep-chip">
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
