import { useState } from "react"
import LoginForm from "./LoginForm"

import { apiService } from "../lib/api"
import { toast } from "react-toastify"
import RegisterForm from "./RegisterFrom"

interface AuthContainerProps {
  onAuthSuccess: (user: { name: string; email: string }) => void
}

export default function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const response = await apiService.login(credentials)
      console.log(response)
    
      if (response.success && response?.data?.user) {
        // toast.success("Login successful!")
        onAuthSuccess(response?.data?.user)
        if(response.data.message.includes('Login'))
        {
             toast.success(response?.data?.message)
        }
        else
          toast.warning(response?.data?.message)
      } else {
        throw new Error(response?.message || "Login failed")
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (userData: { name: string; email: string; password: string }) => {
    setIsLoading(true)
    try {
      const response = await apiService.register(userData)
      console.log(response)
      if (response.success && response.data?.user) {
        toast.success(response.data.message || "Account created successfully!")
        onAuthSuccess(response.data.user)
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const switchToLogin = () => setAuthMode("login")
  const switchToRegister = () => setAuthMode("register")

  return (
    <>
      {authMode === "login" ? (
        <LoginForm onLogin={handleLogin} onSwitchToRegister={switchToRegister}  />
      ) : (
        <RegisterForm onRegister={handleRegister} onSwitchToLogin={switchToLogin} isLoading={isLoading} />
        
      )}
    </>
  )
}
