'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface Filters {
  search: string
  status: string
  priority: string
}

interface TaskFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const reset = () => onChange({ search: '', status: '', priority: '' })
  const hasFilters = filters.search || filters.status || filters.priority

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={(v) => onChange({ ...filters, status: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="TODO">Todo</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="IN_REVIEW">In Review</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.priority || 'all'} onValueChange={(v) => onChange({ ...filters, priority: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={reset} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
