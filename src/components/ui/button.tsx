import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex w-max min-w-max max-w-none shrink-0 flex-none items-center justify-center overflow-visible whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md",
        outline:
          "border border-blue-200 bg-white text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800",
        action:
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
        secondary:
          "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 hover:shadow-sm",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
        success:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md",
        warning:
          "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2 leading-none",
        sm: "h-9 rounded-lg px-3.5 text-xs leading-none",
        lg: "h-11 rounded-lg px-8 leading-none",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
