'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UpgradePrompt({
  open,
  onOpenChange,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  const startCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle>You've tracked 5 subscriptions</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-amber-500/40 bg-zinc-950 p-4 text-zinc-50">
          <p className="text-sm text-zinc-200">
            The average person has 12 active subscriptions totaling $273/month. Upgrade to Pro to
            track them all.
          </p>

          <div className="mt-4 grid gap-2">
            <Button onClick={startCheckout} disabled={loading}>
              {loading ? 'Redirecting…' : 'Upgrade to Pro — $9/month →'}
            </Button>
            <button
              type="button"
              onClick={startCheckout}
              className="text-sm text-zinc-300 hover:text-white transition-colors text-left"
            >
              or $79/year — save 27%
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

