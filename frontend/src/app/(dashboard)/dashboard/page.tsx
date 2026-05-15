'use client'

import Header from '@/components/layout/Header'
import StatCard from '@/components/shared/StatCard'
import TaskTable from '@/components/tasks/TaskTable'
import { useGetTaskStatsQuery, useGetTasksQuery } from '@/services/api'
import { CheckSquare, Clock, AlertCircle, TrendingUp, ListTodo, Layers } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetTaskStatsQuery()
  const { data: tasksPage, isLoading: tasksLoading } = useGetTasksQuery({ page: 0, size: 5, sort: 'createdAt' })

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatCard title="Total Tasks" value={stats?.total ?? 0} icon={Layers} />
              <StatCard title="Todo" value={stats?.todo ?? 0} icon={ListTodo} iconColor="text-gray-600" iconBg="bg-gray-100" />
              <StatCard title="In Progress" value={stats?.inProgress ?? 0} icon={TrendingUp} iconColor="text-blue-600" iconBg="bg-blue-50" />
              <StatCard title="Done" value={stats?.done ?? 0} icon={CheckSquare} iconColor="text-green-600" iconBg="bg-green-50" />
              <StatCard title="Overdue" value={stats?.overdue ?? 0} icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
            </>
          )}
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskTable tasks={tasksPage?.content ?? []} isLoading={tasksLoading} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
