'use client'

import { useSubscriptions } from '@/contexts/subscription-context'
import { UpgradePrompt } from '@/components/subsight/UpgradePrompt'

export function UpgradePromptGate() {
  const { upgradePromptOpen, dismissUpgradePrompt } = useSubscriptions()

  return (
    <UpgradePrompt
      open={upgradePromptOpen}
      onOpenChange={(open) => {
        if (!open) dismissUpgradePrompt()
      }}
    />
  )
}

