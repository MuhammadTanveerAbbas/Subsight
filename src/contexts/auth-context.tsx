"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('subsight_user')
    const savedProfile = localStorage.getItem('subsight_profile')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
    setLoading(false)
  }, [])



  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('subsight_users') || '[]')
      if (existingUsers.find((u: any) => u.email === email)) {
        throw new Error('User already exists')
      }

      const userId = crypto.randomUUID()
      const newUser = { id: userId, email }
      const newProfile = {
        id: userId,
        full_name: fullName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store user credentials (in real app, hash password)
      existingUsers.push({ ...newUser, password })
      localStorage.setItem('subsight_users', JSON.stringify(existingUsers))
      
      // Store user session
      localStorage.setItem('subsight_user', JSON.stringify(newUser))
      localStorage.setItem('subsight_profile', JSON.stringify(newProfile))
      
      setUser(newUser)
      setProfile(newProfile)

      toast({
        title: 'Success',
        description: 'Account created successfully!',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message,
      })
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('subsight_users') || '[]')
      const user = existingUsers.find((u: any) => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }

      const userSession = { id: user.id, email: user.email }
      const profiles = JSON.parse(localStorage.getItem('subsight_profiles') || '[]')
      const userProfile = profiles.find((p: any) => p.id === user.id)
      
      localStorage.setItem('subsight_user', JSON.stringify(userSession))
      if (userProfile) {
        localStorage.setItem('subsight_profile', JSON.stringify(userProfile))
        setProfile(userProfile)
      }
      
      setUser(userSession)

      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message,
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('subsight_user')
      localStorage.removeItem('subsight_profile')
      setUser(null)
      setProfile(null)

      toast({
        title: 'Success',
        description: 'Signed out successfully!',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: error.message,
      })
    }
  }

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      if (!user || !profile) throw new Error('No user logged in')

      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      localStorage.setItem('subsight_profile', JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Error',
        description: error.message,
      })
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}