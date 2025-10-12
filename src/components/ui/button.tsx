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
  /**
   * If true, prevents canvas/stage handlers from seeing this interaction
   * by calling stopPropagation + preventDefault on common pointer events.
   * Useful for toolbars or controls overlaid on a Konva canvas.
   */
  blockCanvasEvents?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      blockCanvasEvents = false,
      type,
      onClick,
      onMouseDown,
      onMouseUp,
      onTouchStart,
      onTouchEnd,
      ...rest
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Wrapper to stop bubbling to the canvas before calling the user handler.
    const wrap =
      <E extends React.SyntheticEvent>(user?: (e: E) => void) =>
      (e: E) => {
        if (blockCanvasEvents) {
          e.preventDefault();
          e.stopPropagation();
        }
        user?.(e);
      };

    return (
      <Comp
        ref={ref}
        type={(type as any) ?? ("button" as any)} // avoid accidental form submits
        className={cn(
          buttonVariants({ variant, size, className }),
          "focus:outline-none active:outline-none active:bg-inherit focus:bg-inherit"
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
        onClick={wrap(onClick)}
        onMouseDown={wrap(onMouseDown)}
        onMouseUp={wrap(onMouseUp)}
        onTouchStart={wrap(onTouchStart)}
        onTouchEnd={wrap(onTouchEnd)}
        {...rest}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };