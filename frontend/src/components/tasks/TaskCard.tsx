'use client'

import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PriorityBadge from './PriorityBadge'
import { format } from 'date-fns'
import { Calendar, User, Paperclip } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statusConfig: Record<string, { label: string; className: string }> = {
  TODO: { label: 'Todo', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

export default function TaskCard({ task }: { task: Task }) {
  const router = useRouter()
  const status = statusConfig[task.status]

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">{task.title}</h3>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {task.assignedToName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>{task.assignedToName}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
