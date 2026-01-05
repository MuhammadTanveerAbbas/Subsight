"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Target, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

function SettingsContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, profile, updateProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      avatarUrl: profile?.avatar_url || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      await updateProfile({
        full_name: data.fullName,
        avatar_url: data.avatarUrl || undefined,
      })
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight font-headline">Subsight</h1>
        </Link>
      </header>

      <main className="container max-w-2xl mx-auto p-3 sm:p-4 md:p-8">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Profile Settings</CardTitle>
            <CardDescription className="text-sm">
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-base sm:text-lg bg-primary text-primary-foreground">
                    {profile?.full_name ? getInitials(profile.full_name) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-medium text-base sm:text-lg">{profile?.full_name || 'User'}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('fullName')}
                  disabled={isLoading}
                  className="h-10 sm:h-11"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-sm">Avatar URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('avatarUrl')}
                  disabled={isLoading}
                  className="h-10 sm:h-11"
                />
                {errors.avatarUrl && (
                  <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Provide a URL to your profile picture
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-10 sm:h-11">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto h-10 sm:h-11">
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}