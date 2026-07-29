'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(profile?.role || 'user')
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (data: { email: string; password: string }) => {
    setError(null)
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      // Récupérer le rôle
      let role = 'user'
      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()
        role = profile?.role || 'user'
        setUserRole(role)
      }

      return { success: true, role }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const signUp = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    confirmPassword: string 
  }) => {
    setError(null)
    try {
      // 1. Créer l'utilisateur dans auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      })

      if (error) throw error

      // 2. Créer le profil dans la table profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
          })

        if (profileError) {
          console.error('Erreur création profil:', profileError)
          // Si le profil existe déjà, on continue
        }
      }

      window.location.href = '/fr/dashboard'
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/fr')
    router.refresh()
  }

  const resetPassword = async (email: string) => {
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/fr/auth/update-password`,
      })

      if (error) throw error
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const updatePassword = async (password: string) => {
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      router.push('/fr/auth/login')
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // hooks/useAuth.ts - AJOUTE CE CODE avant le return

  const signInWithGoogle = async () => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/fr/auth/callback`,
        },
      })

      if (error) throw error
      
      return { success: true }
    } catch (err: any) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
  }
}