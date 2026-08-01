import { cn } from "@/lib/utils";

/** ReUI tree surface. Interaction and data ownership remain with the app tree adapter. */
export function TreeSurface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tree"
      className={cn(
        "size-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
