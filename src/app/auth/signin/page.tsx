"use client"

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Target, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-3 sm:p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center space-y-1.5 sm:space-y-2 px-4 sm:px-5 pt-5">
              <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-headline">Subsight</h1>
              </div>
              <CardTitle className="text-base sm:text-lg">Welcome back</CardTitle>
              <CardDescription className="text-xs">Loading…</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SignInInner />
    </Suspense>
  )
}

function SignInInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error') === 'oauth_failed'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      router.push('/dashboard')
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-3 sm:p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1.5 sm:space-y-2 px-4 sm:px-5 pt-5">
          <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight font-headline">Subsight</h1>
          </div>
          <CardTitle className="text-base sm:text-lg">Welcome back</CardTitle>
          <CardDescription className="text-xs">
            Sign in to your account to continue tracking your subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          {oauthError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              Google sign-in failed. Please try again.
            </div>
          )}

          <GoogleSignInButton mode="signin" />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white dark:bg-gray-900 px-2">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
            <div className="space-y-1 sm:space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="text-sm"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="text-sm"
                  {...register('password')}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <a
              href="/auth/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-900 
              dark:hover:text-gray-100 transition-colors"
            >
              Forgot your password?
            </a>

            <Button type="submit" className="w-full text-xs sm:text-sm" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-3 sm:mt-4 text-center text-xs">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}