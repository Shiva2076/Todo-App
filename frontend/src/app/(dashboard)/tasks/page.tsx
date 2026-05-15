'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskTable from '@/components/tasks/TaskTable'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import { Button } from '@/components/ui/button'
import { useGetTasksQuery } from '@/services/api'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface Filters {
  search: string
  status: string
  priority: string
}

export default function TasksPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', priority: '' })
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const debouncedSearch = useDebounce(filters.search, 400)

  const { data, isLoading } = useGetTasksQuery({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    page,
    size: 15,
  })

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f)
    setPage(0)
  }, [])

  return (
    <>
      <Header title="Tasks" />
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <TaskFilters filters={filters} onChange={handleFiltersChange} />
          </div>
          <Button onClick={() => setShowCreate(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <TaskTable tasks={data?.content ?? []} isLoading={isLoading} />

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {data.totalElements} total tasks
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!data.hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {page + 1} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </>
  )
}
