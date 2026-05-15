'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateTaskMutation } from '@/services/api'
import { Task } from '@/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
  dueDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  task: Task
  open: boolean
  onClose: () => void
}

export default function EditTaskModal({ task, open, onClose }: Props) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : '',
      })
    }
  }, [task, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateTask({
        id: task.id,
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
          assignedToId: task.assignedToId ?? undefined,
        } as any,
      }).unwrap()
      toast.success('Task updated')
      onClose()
    } catch {
      toast.error('Failed to update task')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input {...register('title')} className="mt-1" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea {...register('description')} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority *</Label>
              <Select value={watch('priority')} onValueChange={(v) => setValue('priority', v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Input type="datetime-local" {...register('dueDate')} className="mt-1" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
