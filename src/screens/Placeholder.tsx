interface Props {
  title: string;
  subtitle: string;
}

/** Temporary placeholder used while screens are built incrementally. */
export function Placeholder({ title, subtitle }: Props) {
  return (
    <div className="flex flex-col gap-2 px-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Coming next in the build.
      </div>
    </div>
  );
}
