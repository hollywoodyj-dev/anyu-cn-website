type EmotionListProps = {
  title?: string;
  items: string[];
};

export function EmotionList({ title, items }: EmotionListProps) {
  return (
    <div className="space-y-4">
      {title ? (
        <h2 className="text-xl font-medium text-[var(--anyu-ink)] md:text-2xl">{title}</h2>
      ) : null}
      <ul className="list-none space-y-3 pl-0 text-[var(--anyu-ink)]">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative pl-6 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--anyu-accent)] before:opacity-70"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
