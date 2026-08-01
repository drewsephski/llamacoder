import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const frameVariants = cva("relative flex flex-col rounded-xl bg-muted/50", {
  variants: {
    variant: {
      default: "border border-border",
      inverse: "border border-border bg-background",
      ghost: "bg-transparent",
    },
    spacing: {
      xs: "gap-0.5 p-0.5",
      sm: "gap-1 p-1",
      default: "gap-1.5 p-1.5",
      lg: "gap-2 p-2",
    },
    stacked: {
      true: "gap-0 [&_[data-slot=frame-panel]+[data-slot=frame-panel]]:rounded-t-none [&_[data-slot=frame-panel]+[data-slot=frame-panel]]:border-t-0 [&_[data-slot=frame-panel]:not(:last-child)]:rounded-b-none",
      false: "",
    },
    dense: {
      true: "gap-0 p-0 [&_[data-slot=frame-panel]]:rounded-xl [&_[data-slot=frame-panel]]:shadow-none",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "default",
    stacked: false,
    dense: false,
  },
});

type FrameProps = React.ComponentProps<"div"> &
  VariantProps<typeof frameVariants>;

function Frame({
  className,
  variant,
  spacing,
  stacked,
  dense,
  ...props
}: FrameProps) {
  return (
    <div
      className={cn(
        frameVariants({ variant, spacing, stacked, dense }),
        className,
      )}
      data-slot="frame"
      data-spacing={spacing ?? "default"}
      {...props}
    />
  );
}

function FramePanel({
  className,
  fit,
  ...props
}: React.ComponentProps<"div"> & { fit?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card px-4 py-4 text-card-foreground shadow-sm",
        !fit && "grow",
        className,
      )}
      data-slot="frame-panel"
      {...props}
    />
  );
}

function FrameHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("flex flex-col gap-0.5 px-4 py-2", className)}
      data-slot="frame-panel-header"
      {...props}
    />
  );
}

function FrameTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm font-semibold", className)}
      data-slot="frame-panel-title"
      {...props}
    />
  );
}

function FrameDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="frame-panel-description"
      {...props}
    />
  );
}

function FrameFooter({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn("flex flex-col gap-1 px-4 py-2", className)}
      data-slot="frame-panel-footer"
      {...props}
    />
  );
}

export {
  Frame,
  FramePanel,
  FrameHeader,
  FrameTitle,
  FrameDescription,
  FrameFooter,
  frameVariants,
};
