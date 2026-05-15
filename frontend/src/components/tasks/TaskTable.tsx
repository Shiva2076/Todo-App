'use client'

import { Task } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PriorityBadge from './PriorityBadge'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const statusConfig: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
}

interface TaskTableProps {
  tasks: Task[]
  isLoading?: boolean
}

export default function TaskTable({ tasks, isLoading }: TaskTableProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new task.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow
            key={task.id}
            className="cursor-pointer"
            onClick={() => router.push(`/tasks/${task.id}`)}
          >
            <TableCell className="font-medium max-w-[280px] truncate">{task.title}</TableCell>
            <TableCell><PriorityBadge priority={task.priority} /></TableCell>
            <TableCell>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig[task.status])}>
                {statusLabel[task.status]}
              </span>
            </TableCell>
            <TableCell className="text-gray-600">{task.assignedToName ?? '—'}</TableCell>
            <TableCell className="text-gray-600 whitespace-nowrap">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
