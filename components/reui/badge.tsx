import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "relative inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap border border-transparent font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background text-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        info: "bg-info text-white",
        success: "bg-success text-white",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-white",
        invert: "bg-invert text-invert-foreground",
        focus: "bg-primary text-primary-foreground",
        "primary-light": "border-primary/15 bg-primary/10 text-primary",
        "warning-light":
          "border-warning/20 bg-warning/10 text-warning-foreground",
        "success-light":
          "border-success/20 bg-success/10 text-success-foreground",
        "info-light": "border-info/20 bg-info/10 text-info-foreground",
        "destructive-light":
          "border-destructive/20 bg-destructive/10 text-destructive-foreground",
        "invert-light": "border-foreground/15 bg-foreground/5 text-foreground",
        "focus-light": "border-primary/15 bg-primary/10 text-primary",
        "primary-outline": "border-border bg-background text-primary",
        "warning-outline":
          "border-border bg-background text-warning-foreground",
        "success-outline":
          "border-border bg-background text-success-foreground",
        "info-outline": "border-border bg-background text-info-foreground",
        "destructive-outline":
          "border-border bg-background text-destructive-foreground",
        "invert-outline": "border-border bg-background text-foreground",
        "focus-outline": "border-border bg-background text-primary",
      },
      size: {
        xs: "h-4 min-w-4 gap-1 px-1 text-[10px] leading-none",
        sm: "h-[18px] min-w-[18px] gap-1 px-1 text-[10px] leading-none",
        default: "h-5 min-w-5 gap-1 px-1.5 text-xs",
        lg: "h-[22px] min-w-[22px] gap-1 px-1.5 text-xs",
        xl: "h-6 min-w-6 gap-1.5 px-2 text-sm",
      },
      radius: { default: "rounded-md", full: "rounded-full" },
    },
    defaultVariants: { variant: "default", size: "default", radius: "default" },
  },
);

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, radius }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, type BadgeProps };
