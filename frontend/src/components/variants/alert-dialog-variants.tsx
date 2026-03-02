import {cva} from "class-variance-authority";

export const mediaVariants = cva(
  "flex items-center justify-center rounded-full mb-4 mx-auto mx-auto",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
      },
      size: {
        sm: "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
        md: "h-14 w-14 [&>svg]:h-7 [&>svg]:w-7",
        lg: "h-20 w-20 [&>svg]:h-10 [&>svg]:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export default mediaVariants;