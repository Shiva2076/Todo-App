'use client'

import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUpdateProfileMutation, useUploadAvatarMutation, useGetMeQuery } from '@/services/api'
import { useAppDispatch } from '@/store'
import { updateUser } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { Camera, Save } from 'lucide-react'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { data: user, isLoading } = useGetMeQuery()
  const [fullName, setFullName] = useState('')
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form with user data
  const currentName = fullName || user?.fullName || ''

  const handleSave = async () => {
    try {
      const updated = await updateProfile({ fullName: currentName }).unwrap()
      dispatch(updateUser(updated))
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = await uploadAvatar(file).unwrap()
      dispatch(updateUser(updated))
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    }
    e.target.value = ''
  }

  if (isLoading) return null

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U'

  return (
    <>
      <Header title="Profile" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Avatar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1.5 hover:bg-indigo-700 transition-colors"
                disabled={uploading}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Role: {user?.role}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Change photo'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={fullName || user?.fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled className="mt-1 bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <Button onClick={handleSave} disabled={saving || !fullName}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
