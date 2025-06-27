import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Header from "./components/Header"
 
import ConfigurationForms from "./components/ConfigurationForms"
import Dashboard from "./components/Dashboard"
import { apiService } from "./lib/api"
import AuthContainer from "./components/AuthContainer"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [apiConfigs, setApiConfigs] = useState({
    freshdeskApiKey: "",
    freshdeskDomain: "",
    hubspotToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if(isLoggedIn)
     checkAuthStatus()
  }, [isLoggedIn])
  const toastId=12
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getProtected()
      if (response?.success && response?.data?.user) {
        setIsLoggedIn(true)
        setUser(response?.data.user)
        setApiConfigs(response?.data?.user)
      }
    
      if(response?.message!="success")
      { 
         if(!toast.isActive(toastId))
         toast.warning(response?.message,{toastId})
      }
    } catch (error) {
// console.log("Api unavailable")
      console.log("Not authenticated",error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
     
  }

  const handleLogout = () => {
    apiService.logout()
    setUser(null)
    setIsLoggedIn(false)
    setApiConfigs({
      freshdeskApiKey: "",
      freshdeskDomain: "",
      hubspotToken: "",
    })
     if(!toast.isActive(toastId))
       toast.info("Logged out successfully",{toastId})
  }

  const handleConfigUpdate = async (configs: typeof apiConfigs,type?:string) => {
    try {
      
      if (configs.freshdeskApiKey && configs.freshdeskDomain && type=="freshdesk") {
       const response= await apiService.updateFreshdesk({
          apiKey: configs.freshdeskApiKey,
          domain: configs.freshdeskDomain,
        })
        console.log(response)
        if(!response?.success)
        {
            throw Error(response.error)
        }
        toast.success("Freshdesk configuration updated!")
      }

      if (configs.hubspotToken && type=="hubspot") {
        const response=await apiService.updateHubspot({
          token: configs.hubspotToken,
        })
        if(!response?.success)
        {
            throw Error(response.error)
        }
        toast.success("HubSpot configuration updated!")
      }

      setApiConfigs(configs)
    } catch (error: any) {
      toast.error(error.message || "Configuration update failed")
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
console.log(apiConfigs)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <AuthContainer onAuthSuccess={handleAuthSuccess} />
        ) : (
          <div className="space-y-8">
            <ConfigurationForms configs={apiConfigs} onConfigUpdate={handleConfigUpdate} />
            <Dashboard configs={apiConfigs} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
