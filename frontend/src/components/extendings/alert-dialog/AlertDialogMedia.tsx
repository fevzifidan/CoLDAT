import React from "react";

import { cn } from "@/lib/utils";

import {mediaVariants} from "../../variants/alert-dialog-variants";
import { type VariantProps } from "class-variance-authority";

export interface AlertDialogMediaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mediaVariants> {}

const AlertDialogMedia = React.forwardRef<HTMLDivElement, AlertDialogMediaProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mediaVariants({ variant, size }), className)}
      {...props}
    />
  )
)

export default AlertDialogMedia;