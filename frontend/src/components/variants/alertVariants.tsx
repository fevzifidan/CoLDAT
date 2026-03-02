import { cva } from "class-variance-authority"

export const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "bg-red-50 border-red-200/80 text-red-600 dark:bg-red-500/15 dark:border-red-500/20 dark:text-red-400 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        info: "bg-blue-50 border-blue-200/80 text-blue-600 dark:bg-blue-500/15 dark:border-blue-500/20 dark:text-blue-400[&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        warning: "bg-amber-50 border-amber-200/80 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/20 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)