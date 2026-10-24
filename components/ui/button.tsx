import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-wine-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-wine-800 text-white hover:bg-wine-900 shadow-sm shadow-wine-950/10 border border-wine-700/50",
        wine:
          "bg-wine-800 text-white hover:bg-wine-900 shadow-sm shadow-wine-950/10 border border-wine-700/50",
        outline:
          "border border-border-subtle bg-white text-text-main hover:bg-wine-50 hover:border-wine-200 hover:text-wine-900 shadow-xs",
        wineOutline:
          "border border-wine-200 text-wine-900 bg-wine-50/60 hover:bg-wine-100 hover:border-wine-300",
        secondary:
          "bg-wine-50 text-wine-900 hover:bg-wine-100 border border-wine-100",
        ghost:
          "hover:bg-wine-50 text-text-main hover:text-wine-900",
        dark:
          "bg-text-main text-white hover:bg-wine-950 shadow-sm",
        destructive:
          "bg-status-danger text-white hover:bg-rose-700 shadow-sm",
        link:
          "text-wine-800 underline-offset-4 hover:underline p-0 h-auto font-semibold",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm gap-2",
        xs: "h-7 px-2.5 text-xs gap-1.5 rounded-lg",
        sm: "h-9 px-3.5 text-xs gap-1.5 rounded-lg font-medium",
        lg: "h-12 px-7 text-base gap-2.5 rounded-xl font-semibold",
        xl: "h-14 px-8 text-lg gap-3 rounded-2xl font-semibold",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
