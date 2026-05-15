'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import PriorityBadge from '@/components/tasks/PriorityBadge'
import EditTaskModal from '@/components/tasks/EditTaskModal'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGetTaskQuery,
  useGetTaskActivityLogsQuery,
  usePatchTaskStatusMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} from '@/services/api'
import { format } from 'date-fns'
import { Calendar, User, Edit, ArrowLeft, Paperclip, Trash2, Upload, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done', CANCELLED: 'Cancelled',
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: task, isLoading } = useGetTaskQuery(id)
  const { data: logsPage } = useGetTaskActivityLogsQuery({ taskId: id, page: 0, size: 50 })
  const [patchStatus] = usePatchTaskStatusMutation()
  const [uploadAttachment, { isLoading: uploading }] = useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()

  const handleStatusChange = async (status: string) => {
    try {
      await patchStatus({ id, status }).unwrap()
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadAttachment({ taskId: id, file }).unwrap()
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await deleteAttachment({ taskId: id, attachmentId }).unwrap()
      toast.success('Attachment deleted')
    } catch {
      toast.error('Failed to delete attachment')
    }
  }

  if (isLoading) {
    return (
      <>
        <Header title="Task Detail" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    )
  }

  if (!task) return null

  return (
    <>
      <Header title={task.title} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusConfig[task.status])}>
                  {statusLabel[task.status]}
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <PriorityBadge priority={task.priority} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{task.title}</h2>
              {task.description && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              )}

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span><strong>Assigned to:</strong> {task.assignedToName ?? 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span><strong>Created by:</strong> {task.createdByName}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span><strong>Due:</strong> {format(new Date(task.dueDate), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span><strong>Created:</strong> {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {task.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Attachments ({task.attachments.length})</h3>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              </div>

              {task.attachments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No attachments yet</p>
              ) : (
                <div className="space-y-2">
                  {task.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-900 flex-1 truncate">{att.fileName}</span>
                      <span className="text-xs text-gray-400">{(att.fileSize / 1024).toFixed(1)} KB</span>
                      <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => handleDeleteAttachment(att.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
            <div className="space-y-4">
              {logsPage?.content.length === 0 && (
                <p className="text-sm text-gray-500">No activity yet.</p>
              )}
              {logsPage?.content.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-xs font-medium text-indigo-700">
                    {log.userFullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.userFullName}</span>{' '}
                      <span className="text-gray-600">{log.action.toLowerCase().replace('_', ' ')}</span>
                      {log.newValue && (
                        <span className="text-gray-600"> → <span className="font-medium text-gray-900">{log.newValue}</span></span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal task={task} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  )
}
