'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth()
  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U'

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
