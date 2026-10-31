"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastVariant,
} from "@/components/ui/toast"

// Map variant → default title shown when none is supplied
const DEFAULT_TITLES: Record<string, string> = {
  success:     "Success",
  error:       "Error",
  warning:     "Warning",
  info:        "Info",
  default:     "Info",
  destructive: "Error",
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const v = (variant ?? "info") as ToastVariant
        // Use the supplied title if given; otherwise fall back to the variant label
        const resolvedTitle = title ?? DEFAULT_TITLES[v] ?? "Notice"

        return (
          <Toast key={id} variant={v} {...props}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
              <ToastTitle>{resolvedTitle}</ToastTitle>
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
