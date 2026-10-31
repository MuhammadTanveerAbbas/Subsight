"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

// ── Viewport ─────────────────────────────────────────────────────────────────
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // Stack from bottom-right; safe-area on mobile
      "fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 w-[360px] max-w-[calc(100vw-2.5rem)] outline-none",
      // On small screens: full width, pinned to bottom
      "max-sm:bottom-[84px] max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:px-3",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// ── Variants ──────────────────────────────────────────────────────────────────
const toastVariants = cva(
  [
    // Base layout
    "group relative flex w-full items-start gap-3 overflow-hidden",
    "rounded-xl border px-4 py-3.5 shadow-xl",
    "pointer-events-auto",
    // Swipe-to-dismiss
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
    // Open/close animations (defined below in globals or inline keyframes)
    "data-[state=open]:animate-toast-in",
    "data-[state=closed]:animate-toast-out",
  ].join(" "),
  {
    variants: {
      variant: {
        success:
          "bg-[#0d1f14] border-[rgba(34,197,94,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#f0fdf4] [html[data-theme=light]_&]:border-[rgba(22,163,74,0.30)] [html[data-theme=light]_&]:text-[#111111]",
        error:
          "bg-[#1f0d0d] border-[rgba(239,68,68,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#fff5f5] [html[data-theme=light]_&]:border-[rgba(220,38,38,0.30)] [html[data-theme=light]_&]:text-[#111111]",
        warning:
          "bg-[#1f1600] border-[rgba(245,158,11,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#fffbeb] [html[data-theme=light]_&]:border-[rgba(217,119,6,0.30)] [html[data-theme=light]_&]:text-[#111111]",
        info:
          "bg-[#0d1326] border-[rgba(59,130,246,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#eff6ff] [html[data-theme=light]_&]:border-[rgba(37,99,235,0.30)] [html[data-theme=light]_&]:text-[#111111]",
        // Keep "default" and "destructive" as aliases so any Radix/shadcn code still works
        default:
          "bg-[#0d1326] border-[rgba(59,130,246,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#eff6ff] [html[data-theme=light]_&]:border-[rgba(37,99,235,0.30)] [html[data-theme=light]_&]:text-[#111111]",
        destructive:
          "bg-[#1f0d0d] border-[rgba(239,68,68,0.28)] text-[#f0f0f0] " +
          "[html[data-theme=light]_&]:bg-[#fff5f5] [html[data-theme=light]_&]:border-[rgba(220,38,38,0.30)] [html[data-theme=light]_&]:text-[#111111]",
      },
    },
    defaultVariants: { variant: "info" },
  },
)

// ── Icon + accent colour per variant ─────────────────────────────────────────
const VARIANT_META: Record<
  string,
  { Icon: React.ElementType; color: string; progressColor: string }
> = {
  success:     { Icon: CheckCircle2,   color: "#22c55e", progressColor: "#22c55e" },
  error:       { Icon: AlertCircle,    color: "#ef4444", progressColor: "#ef4444" },
  warning:     { Icon: AlertTriangle,  color: "#f59e0b", progressColor: "#f59e0b" },
  info:        { Icon: Info,           color: "#3b82f6", progressColor: "#3b82f6" },
  default:     { Icon: Info,           color: "#3b82f6", progressColor: "#3b82f6" },
  destructive: { Icon: AlertCircle,    color: "#ef4444", progressColor: "#ef4444" },
}

// ── Auto-dismiss duration (ms) ────────────────────────────────────────────────
const DISMISS_DURATION = 4500

// ── Toast root ────────────────────────────────────────────────────────────────
export type ToastVariant = "success" | "error" | "warning" | "info" | "default" | "destructive"

interface ToastRootProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastRootProps
>(({ className, variant, children, ...props }, ref) => {
  const v = variant ?? "info"
  const meta = VARIANT_META[v] ?? VARIANT_META["info"]!
  const [progress, setProgress] = React.useState(100)
  const startedAt = React.useRef(Date.now())
  const rafRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startedAt.current
      const remaining = Math.max(0, 100 - (elapsed / DISMISS_DURATION) * 100)
      setProgress(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={DISMISS_DURATION}
      className={cn(toastVariants({ variant: v }), className)}
      {...props}
    >
      {/* Accent left bar */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 4,
          bottom: 4,
          width: 3,
          borderRadius: "0 3px 3px 0",
          background: meta.color,
          opacity: 0.85,
        }}
      />

      {/* Icon */}
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          marginTop: 1,
          color: meta.color,
          // Light-mode icon needs to darken slightly handled by CSS var override
        }}
      >
        <meta.Icon
          size={17}
          strokeWidth={2}
          style={{ display: "block" }}
        />
      </span>

      {/* Content slot */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>

      {/* Progress bar */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          width: `${progress}%`,
          background: meta.progressColor,
          opacity: 0.6,
          transition: "width 0.08s linear",
          borderRadius: "0 0 0 12px",
        }}
      />
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

// ── Close button ──────────────────────────────────────────────────────────────
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "shrink-0 self-start rounded-md p-0.5 opacity-40 transition-opacity",
      "hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
      className,
    )}
    toast-close=""
    aria-label="Dismiss notification"
    {...props}
  >
    <X size={14} strokeWidth={2.5} />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

// ── Action button ─────────────────────────────────────────────────────────────
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "mt-1 inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-white/20",
      "bg-transparent px-2.5 text-xs font-medium transition-colors",
      "hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

// ── Title ─────────────────────────────────────────────────────────────────────
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-[13px] font-semibold leading-snug tracking-[-0.01em]",
      "font-[var(--font-display,inherit)]",
      className,
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

// ── Description ───────────────────────────────────────────────────────────────
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-[12px] leading-[1.5] opacity-75 mt-0.5",
      "font-[var(--font-mono,inherit)]",
      className,
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
