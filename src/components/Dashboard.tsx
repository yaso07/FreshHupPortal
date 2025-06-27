
import { useState, useEffect } from "react"
import { Ticket, Calendar, Clock, User, Settings,  RefreshCw } from "lucide-react"
import { apiService } from "../lib/api"
import { toast } from "react-toastify"
import TicketDetailsModal from "./TicketDetailModal"

interface DashboardProps {
  configs: {
    freshdeskApiKey: string
    freshdeskDomain: string
    hubspotToken: string
  }
}

interface WebhookLog {
  id: string
  timestamp: string
  type: string
  payload: any
  source: string
}

export default function Dashboard({ configs }: DashboardProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [activeTab, setActiveTab] = useState("tickets")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
console.log(configs)
  const isConfigured = configs.freshdeskApiKey && configs.freshdeskDomain 
  
  useEffect(() => {
    if (isConfigured) {
     
      if (configs.freshdeskApiKey && configs.freshdeskDomain) {
        setActiveTab("tickets")
      } else if (configs.hubspotToken) {
        setActiveTab("contacts")
      }
      loadData()
    }
  }, [isConfigured])

  
  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadTickets(),
        loadWebhookLogs(),
       
      ])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTickets = async () => {
    try {
      const response = await apiService.getFreshdeskTickets()
      if (response.success) {
        

       const tickets = response.data || [];


  tickets.map(async (ticket: any) => {
    try {
      const contact= await apiService.getFreshdeskContactDetails(ticket.requester_id)
    

     
      if(contact.success)
      {
      ticket.requester_email = contact?.data?.email || null;
      ticket.requester_name = contact?.data?.name || null;
      }
 
      return ticket;
    } catch (error) {
      console.error(`Error loading ticket ${ticket.id}:`, error);
      ticket.requester_email = null;
      ticket.requester_name = null;
      ticket.conversations = [];
      return ticket;
    }
  })

   setTickets(tickets || [])
 

 
      }
    } catch (error: any) {
      toast.error("Failed to load tickets: " + error.message)
    }
  }

  const loadWebhookLogs = async () => {
    try {
      const response = await apiService.getWebhookLogs()
      if (response.success) {
        setWebhookLogs(response.data || [])
      }
    } catch (error: any) {
      toast.error("Failed to load webhook logs: " + error.message)
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return "bg-white text-black"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      case 4:
        return "bg-green-100 text-green-800"
      
      case 5:
        return "bg-gray-100 text-gray-800"
      case 6:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string | number) => {
    switch (priority?.toString().toLowerCase()) {
      case "4":
          return "bg-red-100 text-red-900"
      case "3":
        return "bg-red-100 text-red-500"
      case "medium":
      case "2":
        return "bg-yellow-100 text-yellow-800"
      case "low":
      case "1":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // const getPriorityColor = (priority: string | number) => {
  //   switch (priority?.toString().toLowerCase()) {
     
  //     case "2":
  //       return "bg-yellow-100 text-yellow-800"
  //     case "low":
  //     case "1":
  //       return "bg-green-100 text-green-800"
  //     default:
  //       return "bg-gray-100 text-gray-800"
  //   }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setIsTicketModalOpen(true)
  }

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
  }

  if (!isConfigured) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center flex flex-col items-center gap-[10px]">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Required</h3>
            <p className="text-gray-500">Please configure your API credentials to view the dashboard</p>
             <div className="text-left">
               <p className="text-gray-500">Step1 : <span className="text-blue-800">Add your freshdesk credentials</span> </p>
            <p className="text-gray-500">Step2 : <span className="text-blue-800">Add your hubspot token</span></p>
             </div>
          </div>
        </div>
      </div>
    )
  }

 
console.log(tickets)
  return (
    <div className="space-y-6">
   
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 md:p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {tickets.filter((t) => t.status === 2 || t.status === "Open").length} open tickets
              </p>
            </div>
            
          </div>
        </div>

        
       

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 md:p-6 ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Webhook Logs</p>
              <p className="text-2xl font-bold text-gray-900">{webhookLogs.length}</p>
              <p className="text-xs text-gray-500 mt-1">Recent webhooks</p>
            </div>
             
          </div>
        </div>
      </div>

     
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-6">
            <div className="flex space-x-8">
              {configs.freshdeskApiKey && configs.freshdeskDomain && (
                <>
                  <button
                    onClick={() => setActiveTab("tickets")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "tickets"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Tickets
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("webhooks")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "webhooks"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Webhook Logs
                  </button>
                </>
              )}
              
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-2 md:p-6 ">
          {activeTab === "tickets" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Freshdesk Tickets</h3>
                <p className="text-sm text-gray-600">Recent support tickets from your Freshdesk account</p>
              </div>
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tickets found</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleTicketClick(ticket.id.toString())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{ticket.requester_name || ticket.requester_id || "Unknown"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(ticket.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status === 2
                              ? "Open"
                              : ticket.status === 3
                                ? "Pending"
                                : ticket.status === 4
                                  ? "Resolved"
                                  : ticket.status === 5
                                    ? "Closed"
                                    : ticket.status==6?
                                    "Waiting on Customer":ticket.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority === 1
                              ? "Low"
                              : ticket.priority === 2
                                ? "Medium"
                                : ticket.priority === 3
                                  ? "High"
                                  : ticket.priority === 4
                                    ? "Urgent"
                                    : ticket.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        
         

          {activeTab === "webhooks" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Webhook Logs</h3>
                <p className="text-sm text-gray-600">Recent webhook events received from integrations</p>
              </div>
              <div className="space-y-4">
                {webhookLogs.length === 0 ? (
                  <div className="text-center py-8">
                    
                    <p className="text-gray-500">No webhook logs found</p>
                  </div>
                ) : (
                  webhookLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                         
                      </div>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-xs text-gray-600 mb-1">Payload:</p>
                        <pre className="text-xs text-gray-800 overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <TicketDetailsModal ticketId={selectedTicketId} isOpen={isTicketModalOpen} onClose={handleCloseTicketModal} />
    </div>
  )
}
