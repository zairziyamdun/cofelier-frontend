// Раздел панели, который появится на следующих этапах.
export function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl md:text-4xl">{title}</h1>
      <p className="max-w-xl rounded-xl border border-dashed border-border p-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
