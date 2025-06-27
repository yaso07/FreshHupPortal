import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface ApiResponse<T = any> {
  user?: any|T
  success?: boolean
  data?: any
  message?: string
  error?: string,
  token?:string,
}

class ApiService {
  private axiosInstance: AxiosInstance
  private token: string |any

  constructor() {
    this.token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token) config.headers.Authorization = `Bearer ${this.token}`
      return config
    })
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config)
      return {success:true,data:response.data}
    } catch (err: any) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Request failed",
      }
    }
  }
 //auth
  async register(userData: { name: string; email: string; password: string }) {
    const res = await this.request<{ token: string; user: any }>({
      url: "/register",
      method: "POST",
      data: userData,
    })
  
    if (res.success && res.data?.token) {
      this.token = res.data.token
      localStorage.setItem("auth_token", this.token)
    }

    return res
  }

  async login(credentials: { email: string; password: string }) {
    const res = await this.request<{ token: string; user: any ;message:string}>({
      url: "/login",
      method: "POST",
      data: credentials,
    })

 
    if (res?.data?.token) {
      this.token = res?.data?.token
      localStorage.setItem("auth_token", this.token)
    }

    return res
  }

  async getProtected() {
    return this.request<{ user: any }>({ url: "/user" })
  }

  //fresh desk api
  updateFreshdesk(config: { apiKey: string; domain: string }) {
    return this.request({ url: "/freshdesk", method: "POST", data: config })
  }

  getFreshdeskTickets() {
    return this.request({ url: "/freshdesk/tickets" })
  }

  getFreshdeskTicketDetails(ticketId: string) {
    return this.request({ url: `/freshdesk/tickets/${ticketId}` })
  }

  getFreshdeskTicketConversations(ticketId: string) {
    return this.request({ url: `/freshdesk/tickets/${ticketId}/conversations` })
  }

  //hupspot
  updateHubspot(config: { token: string }) {
    return this.request({ url: "/hubspot", method: "POST", data: config })
  }

 
  async getHubspotContactByEmail(email: string) {
    
    return await this.request({url:`/hubspot/contact?email=${encodeURIComponent(email)}`})
    
  }

  async getFreshdeskContactDetails(requestedId:number)
  {
      return await this.request({url:`/freshdesk/contacts/${requestedId}`})
  }

 //webhook
  getWebhookLogs() {
    return this.request({ url: "/webhook/logs" })
  }

  
  logout() {
    this.token = null
    localStorage.removeItem("auth_token")
  }

  isAuthenticated(): boolean {
    return !!this.token
  }
}

export const apiService = new ApiService()
