import { createContext, useContext, useState, useEffect } from 'react'
import type { User, AuthState } from '@/types/auth'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // TODO: Implement session check
        setAuthState(state => ({ ...state, isLoading: false }))
      } catch (error) {
        setAuthState(state => ({
          ...state,
          isLoading: false,
          error: 'Failed to restore session',
        }))
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(state => ({ ...state, isLoading: true, error: null }))
    try {
      // TODO: Implement login logic
      setAuthState(state => ({
        ...state,
        isLoading: false,
        isAuthenticated: true,
        // Add user data here
      }))
    } catch (error) {
      setAuthState(state => ({
        ...state,
        isLoading: false,
        error: 'Login failed',
      }))
      throw error
    }
  }

  const logout = () => {
    // TODO: Implement logout logic
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  const register = async (userData: Partial<User>) => {
    setAuthState(state => ({ ...state, isLoading: true, error: null }))
    try {
      // TODO: Implement registration logic
      setAuthState(state => ({
        ...state,
        isLoading: false,
        // Don't authenticate yet - waiting for verification
      }))
    } catch (error) {
      setAuthState(state => ({
        ...state,
        isLoading: false,
        error: 'Registration failed',
      }))
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}