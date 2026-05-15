import { Badge } from '@/components/ui/badge'
import { Priority } from '@/types'

const config: Record<Priority, { label: string; variant: 'secondary' | 'default' | 'warning' | 'destructive' }> = {
  LOW: { label: 'Low', variant: 'secondary' },
  MEDIUM: { label: 'Medium', variant: 'default' },
  HIGH: { label: 'High', variant: 'warning' },
  URGENT: { label: 'Urgent', variant: 'destructive' },
}

// Map our custom variants to badge variant prop
const variantMap = {
  secondary: 'secondary',
  default: 'default',
  warning: 'warning',
  destructive: 'destructive',
} as const

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, variant } = config[priority]
  return <Badge variant={variantMap[variant] as any}>{label}</Badge>
}
