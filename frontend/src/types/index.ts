export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type Role = 'USER' | 'ADMIN'

export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  publicId: string
  contentType: string
  fileSize: number
  uploadedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  dueDate: string | null
  reminderSent: boolean
  assignedToId: string | null
  assignedToName: string | null
  createdById: string
  createdByName: string
  attachments: Attachment[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  role: Role
  enabled: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  taskId: string
  taskTitle: string
  userId: string
  userFullName: string
  action: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  inReview: number
  done: number
  overdue: number
}
