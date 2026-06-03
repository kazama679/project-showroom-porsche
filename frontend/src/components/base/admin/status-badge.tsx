import * as React from 'react'

import { Badge } from '@/components/base/ui/badge'

interface StatusBadgeProps {
  active: boolean
  activeLabel: string
  inactiveLabel: string
}

function StatusBadge({ active, activeLabel, inactiveLabel }: StatusBadgeProps) {
  return (
    <Badge variant={active ? 'success' : 'outline'}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  )
}

export { StatusBadge }
