import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconTileVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center align-middle [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        outline: "border border-border bg-background",
        elevated: "border border-border bg-muted text-foreground shadow-sm",
        soft: "border border-current/15 bg-current/10 text-primary",
        solid: "bg-primary text-primary-foreground",
        frame:
          "border-4 border-muted bg-card text-foreground shadow-sm ring-1 ring-border",
      },
      size: {
        xs: "size-6 [&_svg]:size-3.5",
        sm: "size-8 [&_svg]:size-4",
        default: "size-10 [&_svg]:size-[18px]",
        lg: "size-12 [&_svg]:size-[22px]",
        xl: "size-14 [&_svg]:size-7",
      },
      radius: { default: "rounded-lg", full: "rounded-full" },
    },
    defaultVariants: { variant: "outline", size: "default", radius: "default" },
  },
);

interface IconTileProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof iconTileVariants> {
  asChild?: boolean;
}

function IconTile({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: IconTileProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="icon-tile"
      className={cn(iconTileVariants({ variant, size, radius }), className)}
      {...props}
    />
  );
}

export { IconTile, iconTileVariants, type IconTileProps };
