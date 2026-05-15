'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRegisterMutation } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { CheckSquare } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { login } = useAuth()
  const [registerMutation, { isLoading }] = useRegisterMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerMutation({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap()
      login(result)
      toast.success('Account created! Welcome aboard.')
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Task Manager</h1>
          <p className="text-gray-500 mt-1">Create your free account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Fill in the details below to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Jane Smith" {...register('fullName')} className="mt-1" />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" {...register('email')} className="mt-1" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label>Password</Label>
                <Input type="password" placeholder="Min. 8 characters" {...register('password')} className="mt-1" />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Repeat password" {...register('confirmPassword')} className="mt-1" />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
