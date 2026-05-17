import Link from "next/link";

type Item = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted)" }}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--foreground)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
