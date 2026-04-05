interface Props {
  children: React.ReactNode;
  sub?: string;
}

export function SectionHeading({ children, sub }: Props) {
  return (
    <div className="section-heading">
      <h2>{children}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  );
}
