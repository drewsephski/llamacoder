import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative backface-hidden will-change-transform box-border",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-primary/80 border-b-[4px] hover:bg-primary/90 hover:-translate-y-[1px] hover:border-b-[6px] active:bg-primary/85 active:border-b-[2px] active:translate-y-[2px]",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive/80 border-b-[4px] hover:bg-destructive/90 hover:-translate-y-[1px] hover:border-b-[6px] active:bg-destructive/85 active:border-b-[2px] active:translate-y-[2px]",
        outline:
          "bg-background text-foreground border-input border-b-[4px] hover:bg-accent hover:text-accent-foreground hover:-translate-y-[1px] hover:border-b-[6px] active:bg-accent/85 active:border-b-[2px] active:translate-y-[2px]",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary/80 border-b-[4px] hover:bg-secondary/90 hover:text-secondary-foreground hover:-translate-y-[1px] hover:border-b-[6px] active:bg-secondary/85 active:border-b-[2px] active:translate-y-[2px]",
        navCta:
          "bg-nav-button text-foreground border-none hover:bg-nav-button/80 active:scale-[0.97]",
        ghost:
          "bg-transparent text-foreground border-transparent border-b-[4px] hover:bg-accent/80 hover:text-accent-foreground hover:-translate-y-[1px] hover:border-b-[6px] active:bg-accent/90 active:border-b-[2px] active:translate-y-[2px]",
        link: "bg-transparent text-primary border-transparent border-b-[4px] hover:text-primary/90 hover:underline hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:translate-y-[2px]",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8",
        icon: "h-9 w-9",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
