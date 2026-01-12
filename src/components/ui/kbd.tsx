import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const kbdVariants = cva(
  "bg-muted text-muted-foreground pointer-events-none inline-flex w-fit items-center justify-center gap-1 rounded-sm font-sans font-medium select-none [&_svg:not([class*='size-'])]:size-3 [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-xs",
        md: "h-6 min-w-6 px-1.5 text-sm",
        lg: "h-7 min-w-7 px-2 text-base",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export interface KbdProps
  extends React.ComponentProps<"kbd">,
    VariantProps<typeof kbdVariants> {}

function Kbd({ className, size, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(kbdVariants({ size, className }))}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
