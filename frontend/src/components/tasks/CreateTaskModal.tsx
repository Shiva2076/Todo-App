'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateTaskMutation } from '@/services/api'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateTaskModal({ open, onClose }: Props) {
  const [createTask, { isLoading }] = useCreateTaskMutation()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', status: 'TODO' },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createTask({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      } as any).unwrap()
      toast.success('Task created')
      reset()
      onClose()
    } catch {
      toast.error('Failed to create task')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} className="mt-1" placeholder="Task title" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} className="mt-1" placeholder="Optional description" />
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
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="datetime-local" {...register('dueDate')} className="mt-1" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
