import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { signup, onAuthStateChange } from '@/lib/auth'
import { UserData } from '@/types/beauty'
import { getAuth, updateProfile } from 'firebase/auth'

type SignUpForm = {
  name: string
  email: string
  password: string
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState<SignUpForm>({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<UserData | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        navigate('/')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const validateField = (field: keyof SignUpForm, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (value.length > 80) return 'Name must be at most 80 characters'
        return null
      
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Invalid email format'
        return null
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (value.length > 128) return 'Password must be at most 128 characters'
        if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter'
        if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter'
        if (!/[0-9]/.test(value)) return 'Password must include a number'
        return null
      
      default:
        return null
    }
  }

  const handleInputChange = (field: keyof SignUpForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Validate field in real-time
    const fieldError = validateField(field, value)
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous states
    setError(null)
    setSuccess(null)
    
    // Validate all fields
    const errors: Record<string, string> = {}
    Object.entries(form).forEach(([field, value]) => {
      const error = validateField(field as keyof SignUpForm, value)
      if (error) {
        errors[field] = error
      }
    })
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    setLoading(true)
    
    try {
      // Create user with Firebase Authentication
      const userData = await signup({
        email: form.email,
        password: form.password,
      })

      // Update the user's display name
      const auth = getAuth()
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: form.name
        })
      }
      
      setSuccess(userData)
      
      toast({
        title: "Account created successfully!",
        description: `Welcome, ${form.name}! You can now book appointments.`,
      })
      
      // Reset form after successful signup
      setForm({ name: '', email: '', password: '' })
      setFieldErrors({})
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Sign-up failed. Please try again.'
      setError(errorMessage)
      
      toast({
        title: "Sign-up failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = Object.values(fieldErrors).every(error => !error) && 
                     Object.values(form).every(value => value.trim() !== '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our beauty services platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={fieldErrors.name ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className={fieldErrors.email ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={fieldErrors.password ? 'border-red-500' : ''}
                  disabled={loading}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Password must be 8-128 characters and include uppercase, lowercase, and number.
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Welcome, {success.name}! Your account has been created successfully.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
