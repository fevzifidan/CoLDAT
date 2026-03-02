// ConfirmContext.tsx
import React, { createContext, useCallback, useRef, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogMedia } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type ConfirmContextType, type ConfirmOptions } from "@/shared/services/confirmation/types";
import { cn } from "@/lib/utils";

import { db } from "@/shared/services/storage/db";

export const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ConfirmOptions>({ title: "" });
  const [dontAskAgainChecked, setDontAskAgainChecked] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(async (params: string | ConfirmOptions) => {
    // Eğer sadece string gelirse objeye çevir, obje gelirse aynen kullan
    const options: ConfirmOptions = typeof params === "string" 
      ? { title: params } 
      : params;
    
    // Check whether "Do not ask again" preference is set
    if (options.dontAskAgain?.id) {
      const preference = await db.userConfirmationPreferences.get(options.dontAskAgain.id);
      if (preference?.skipped) {
        return true; // If record exists in db, do not open the dialog window, return true directly.
      }
    }

    // Get modal's state ready
    setState(options);
    setDontAskAgainChecked(false); // Reset checkbox each time modal opened
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = async (value: boolean) => {
    if (!resolveRef.current) return;

    const resolve = resolveRef.current;
    resolveRef.current = null;

    // If the user approved the confirmation and checked
    // "Do not ask again", record the preference into db
    if (value && state.dontAskAgain?.id && dontAskAgainChecked) {
      await db.userConfirmationPreferences.put({
        id: state.dontAskAgain.id,
        skipped: true
      });
    }

    setOpen(false);
    resolve(value);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(v) => {
          if (!v && resolveRef.current) {
            close(false);
            }
          }
        }
      >
        <AlertDialogContent className={cn(state.size === "sm" ? "max-w-sm" : "", "overflow-hidden")}>
          <AlertDialogHeader className={state.icon ? "flex flex-col items-center text-center sm:text-center" : ""}>
            {state.icon && (
              <AlertDialogMedia 
                variant={state.variant || "default"} 
                size={state.iconSize || "md"}
              >
                {state.icon}
              </AlertDialogMedia>
            )}
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription>{state.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          {/* CHECKBOX SECTION: It is only visible if the dontAskAgain option has been sent. */}
          {state.dontAskAgain && (
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="dont-ask-again" 
                checked={dontAskAgainChecked}
                onCheckedChange={(checked) => setDontAskAgainChecked(!!checked)}
              />
              <Label 
                htmlFor="dont-ask-again" 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {state.dontAskAgain.label || "Bir daha sorma"}
              </Label>
            </div>
          )}
          <AlertDialogFooter className={cn("bg-muted -mx-6 -mb-6 px-6 py-4 border-t", state.icon ? "sm:justify-center" : "")}>
            <AlertDialogCancel onClick={() => close(false)}>
              {state.cancelText || "Vazgeç"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className={ buttonVariants({ variant: state.variant ? state.variant : "default" }) }
            >
              {state.confirmText || "Tamam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};