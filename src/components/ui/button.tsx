
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:ring-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation active:ring-0 active:outline-none",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-gray-100",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        selected: "bg-red-500 text-white",
        ghost: "bg-transparent hover:bg-gray-100",
        active: "bg-green-500 text-white hover:bg-green-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
      <Comp
        ref={ref}
        type={(type as any) ?? ("button" as any)}
        className={cn(
          buttonVariants({ variant, size, className }),
          "focus:outline-none active:outline-none active:bg-inherit focus:bg-inherit"
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
        onPointerDown={stopPropagation}
        onTouchStart={stopPropagation}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
