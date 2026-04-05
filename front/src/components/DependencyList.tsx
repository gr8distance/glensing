interface Props {
  title: string;
  deps: string[];
}

export function DependencyList({ title, deps }: Props) {
  if (!deps.length) return null;

  return (
    <div className="dep-list">
      <h3 className="dep-list-title">{title}</h3>
      <div className="dep-list-items">
        {deps.map((name) => (
          <a key={name} href={`/packages/${name}`} className="dep-chip">
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
