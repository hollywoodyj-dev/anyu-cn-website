type TextBlockProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
};

export function TextBlock({ children, className = "", as: Tag = "div", id }: TextBlockProps) {
  return (
    <Tag id={id} className={`space-y-4 text-[var(--anyu-ink)] ${className}`.trim()}>
      {children}
    </Tag>
  );
}
