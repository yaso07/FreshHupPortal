import type React from "react"
import { useEffect, useState } from "react"
import {  AlertCircle } from "lucide-react"

interface ConfigurationFormsProps {
  configs: {
    freshdeskApiKey: string
    freshdeskDomain: string
    hubspotToken: string
  }
  onConfigUpdate: (configs: {
    freshdeskApiKey: string
    freshdeskDomain: string
    hubspotToken: string,
  },type:string) => Promise<void>
}

interface FormErrors {
  freshdeskDomain?: string
  freshdeskApiKey?: string
  hubspotToken?: string
}

export default function ConfigurationForms({ configs, onConfigUpdate }: ConfigurationFormsProps) {
  console.log(configs,"27")
  const [formData, setFormData] = useState(configs)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("freshdesk")
   const isConfigured = configs.freshdeskApiKey && configs.freshdeskDomain 
  const isHubspot=configs.hubspotToken
   useEffect(()=>{
        setFormData({...configs})
   },[configs])
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (activeTab === "freshdesk") {
      if (!formData.freshdeskDomain.trim()) {
        newErrors.freshdeskDomain = "Domain name is required"
      } else if (!/^[a-zA-Z0-9-]+/.test(formData.freshdeskDomain)) {
        newErrors.freshdeskDomain = "Please enter a valid Freshdesk domain (e.g., your-domain)"
      }

      if (!formData.freshdeskApiKey.trim()) {
        newErrors.freshdeskApiKey = "API key is required"
      } else if (formData.freshdeskApiKey.length < 10) {
        newErrors.freshdeskApiKey = "API key seems too short"
      }
    }

    if (activeTab === "hubspot") {
      if (!formData.hubspotToken.trim()) {
        newErrors.hubspotToken = "Access token is required"
      } else if (formData.hubspotToken.length < 20) {
        newErrors.hubspotToken = "Access token seems too short"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      if(activeTab=="hubspot")
      {
      await onConfigUpdate(formData,activeTab)
      }
      else{
         await onConfigUpdate(formData,activeTab)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

   
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
           
          <h2 className="text-xl font-bold text-gray-900">API Configuration</h2>
        </div>
        <p className="text-gray-600 mt-1">Configure your Freshdesk and HubSpot API credentials</p>
      </div>
      <div className="p-6">
        <div className="w-full">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("freshdesk")}
              className={`w-full rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === "freshdesk" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Freshdesk
            </button>
            <button
              onClick={() => setActiveTab("hubspot")}
              className={`w-full rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === "hubspot" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              } ${(!isConfigured && !isHubspot)?'cursor-[not-allowed]':'cursor-pointer'}`}
              disabled={!isConfigured && !isHubspot}
            >
              HubSpot
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            {activeTab === "freshdesk" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="freshdeskDomain" className="block text-sm font-medium text-gray-700">
                    Domain Name
                  </label>
                  <div className="relative">
                  
                    <input
                      id="freshdeskDomain"
                      name="freshdeskDomain"
                      type="text"
                      placeholder="your-domain"
                      value={formData.freshdeskDomain}
                      onChange={handleChange}
                      className={`block w-full pl-2 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.freshdeskDomain ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <p className="text-gray-500 text-[14px] mt-2">ex: https://<span className="text-red-500">locker2265</span>.freshdesk.com/a/profiles</p>

                  </div>
                  {errors.freshdeskDomain && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.freshdeskDomain}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="freshdeskApiKey" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="relative">
                    
                    <input
                      id="freshdeskApiKey"
                      name="freshdeskApiKey"
                      type="password"
                      placeholder="Enter your Freshdesk API key"
                      value={formData.freshdeskApiKey}
                      onChange={handleChange}
                      className={`block w-full pl-2 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.freshdeskApiKey ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                                    </div>
                  {errors.freshdeskApiKey && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.freshdeskApiKey}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "hubspot" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="hubspotToken" className="block text-sm font-medium text-gray-700">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      id="hubspotToken"
                      name="hubspotToken"
                      type="password"
                      placeholder="Enter your HubSpot access token"
                      value={formData.hubspotToken}
                      onChange={handleChange}
                      className={`block w-full pl-2 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.hubspotToken ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.hubspotToken && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.hubspotToken}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving Configuration..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
