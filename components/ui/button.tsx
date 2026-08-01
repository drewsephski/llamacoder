import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-[color,background-color,border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-primary/80 bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 active:bg-primary/85 active:shadow-none",
        destructive:
          "border border-destructive/80 bg-destructive text-destructive-foreground shadow-sm shadow-destructive/20 hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20 active:bg-destructive/85 active:shadow-none",
        outline:
          "border border-input bg-background text-foreground shadow-sm hover:border-foreground/15 hover:bg-accent hover:text-accent-foreground hover:shadow-md active:bg-accent/80 active:shadow-none",
        secondary:
          "border border-border/60 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:text-secondary-foreground hover:shadow-md active:bg-secondary/70 active:shadow-none",
        navCta:
          "border border-border/50 bg-nav-button text-foreground shadow-sm hover:bg-nav-button/80 hover:shadow-md active:shadow-none",
        ghost:
          "border border-transparent bg-transparent text-foreground shadow-none hover:bg-accent/80 hover:text-accent-foreground active:bg-accent",
        link: "bg-transparent text-primary shadow-none underline-offset-4 hover:text-primary/90 hover:underline",
      },
      size: {
        xs: "h-8 rounded-md px-3 text-xs",
        sm: "h-9 px-3.5",
        default: "h-10 px-5",
        lg: "h-11 px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-8 rounded-md",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="button"
        data-variant={variant ?? "default"}
        data-size={size ?? "default"}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
