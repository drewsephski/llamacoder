import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-center gap-x-2.5 gap-y-0.5 rounded-lg border px-3 py-2.5 text-sm has-[>svg]:grid-cols-[1rem_1fr] [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        destructive:
          "border-destructive/30 bg-destructive/5 [&>svg]:text-destructive",
        info: "border-info/30 bg-info/5 [&>svg]:text-info",
        success: "border-success/30 bg-success/5 [&>svg]:text-success",
        warning:
          "border-warning/30 bg-warning/5 [&>svg]:text-warning-foreground",
        invert: "border-invert bg-invert text-invert-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-start-2 mt-2 flex gap-1.5 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants };
