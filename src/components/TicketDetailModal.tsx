
import { useState, useEffect } from "react"
import { X, User, Calendar, Clock, MessageCircle, Tag, AlertCircle, CheckCircle, XCircle, Users,CircleUser } from "lucide-react"
import { apiService } from "../lib/api"
import { toast } from "react-toastify"

interface TicketDetailsModalProps {
  ticketId: string | null
  isOpen: boolean
  onClose: () => void
}

interface Ticket {
  requester_email: string
  id: number
  subject: string
  description?: string
  status: number
  priority: number
  requester_id: string
  created_at: string
  updated_at: string
  tags?: string[]
  type?: string
  source?: number
}

interface Conversation {
  id: number
  ticket_id: number
  body_text: string
  body?: string
  user_id: number | null
  created_at: string
  updated_at?: string
  from_email?: string
  to_emails?: string[]
  attachments?: any[]
}

interface HubSpotContact {
  id: number
  email: string
  name:string,
  lifecycleStage?: string
  phone?: string
  company?: string
}

export default function TicketDetailsModal({ ticketId, isOpen, onClose }: TicketDetailsModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [hubspotContact, setHubspotContact] = useState<HubSpotContact | null>(null)
  const [isLoadingContact, setIsLoadingContact] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
console.log(hubspotContact)
  useEffect(() => {
    if (isOpen && ticketId) {
      loadTicketDetails()
    }
  }, [isOpen, ticketId])

  const loadHubSpotContact = async (email: string) => {
    setIsLoadingContact(true)
    setContactError(null)
    try {
      const response = await apiService.getHubspotContactByEmail(email)
      if (response.success && response.data) {
        setHubspotContact(response.data)
      } else {
        console.log(response)
        setContactError(response?.message||"No HubSpot contact found for this email")
      }
    } catch (error: any) {
      setContactError("Failed to load HubSpot contact data")
      console.error("Error loading HubSpot contact:", error)
    } finally {
      setIsLoadingContact(false)
    }
  }

  const loadTicketDetails = async () => {
    if (!ticketId) return

    setIsLoading(true)
    try {
     
      const ticketResponse = await apiService.getFreshdeskTicketDetails(ticketId)
      if (ticketResponse.success) {
        setTicket(ticketResponse.data)
        const contact=await apiService.getFreshdeskContactDetails(ticketResponse.data.requester_id)
        if(contact.success)
           setTicket({...ticketResponse.data,requester_name:contact.data.name||null,requester_email:contact.data.email||null})
       
        if (contact.data.email) {
          await loadHubSpotContact(contact.data.email)
        }
      }

      const conversationsResponse = await apiService.getFreshdeskTicketConversations(ticketId)
      if (conversationsResponse.success) {
        setConversations(conversationsResponse.data || [])
      }
    } catch (error: any) {
      toast.error("Failed to load ticket details: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 2:
        return { label: "Open", color: "bg-white text-gray-800" , icon: AlertCircle }
      case 3:
        return { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock }
      case 4:
        return { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle }
      case 5:
        return { label: "Closed", color: "bg-gray-100 text-gray-800", icon: XCircle }
      case 6:
         return { label: "Waiting on Customer", color: "bg-gray-100 text-gray-800", icon: CircleUser } 
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
    }
  }

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { label: "Low", color: "bg-green-100 text-green-800" }
      case 2:
        return { label: "Medium", color: "bg-yellow-100 text-yellow-800" }
      case 3:
        return { label: "High", color: "bg-red-100 text-red-800" }
      case 4:
        return { label: "Urgent", color: "bg-red-200 text-red-900" }
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800" }
    }
  }

  const getSourceInfo = (source: number) => {
    switch (source) {
      case 1:
        return "Email"
      case 2:
        return "Portal"
      case 3:
        return "Phone"
      case 7:
        return "Chat"
      case 9:
        return "Feedback Widget"
      case 10:
        return "Outbound Email"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  

  if (!isOpen) return null
console.log(ticket)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
       
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Ticket Details</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading ticket details...</span>
            </div>
          ) : ticket ? (
            <div className="bg-white">
             
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "details"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("conversations")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "conversations"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Conversations ({conversations.length})
                  </button>
                </nav>
              </div>

         
              <div className="p-6 max-h-96 overflow-y-auto">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">{ticket.subject}</h2>

                   
                      <div className="flex items-center space-x-4 mb-4">
                        {(() => {
                          const statusInfo = getStatusInfo(ticket.status)
                          const StatusIcon = statusInfo.icon
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </span>
                          )
                        })()}

                        {(() => {
                          const priorityInfo = getPriorityInfo(ticket.priority)
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}
                            >
                              {priorityInfo.label} Priority
                            </span>
                          )
                        })()}
                      </div>

                 
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Requester:</span>
                          <span className="text-sm font-medium text-gray-900">{ticket?.requester_email || ticket.requester_id}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(ticket.created_at)}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Updated:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(ticket.updated_at)}</span>
                        </div>

                        {ticket.source && (
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Source:</span>
                            <span className="text-sm font-medium text-gray-900">{getSourceInfo(ticket.source)}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Tags:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ticket.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                   
                      {ticket.description && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                          <div className="bg-white border border-gray-200 rounded-md p-4">
                            <div
                              className="text-sm text-gray-700 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: ticket.description }}
                            />
                          </div>
                        </div>
                      )}

                  
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">HubSpot Contact Information</h3>
                        {isLoadingContact ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-gray-600">Loading HubSpot contact data...</span>
                            </div>
                          </div>
                        ) : hubspotContact ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <Users className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="font-medium text-blue-900">Contact Found in HubSpot</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="text-sm font-medium text-gray-900 ml-2">
                                  {hubspotContact.name 
                                    ? `${hubspotContact.name || ""}`.trim()
                                    : "Not provided"}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm font-medium text-gray-900 ml-2">{hubspotContact.email}</span>
                              </div>
                              {hubspotContact.lifecycleStage && (
                                <div>
                                  <span className="text-sm text-gray-600">Lifecycle Stage:</span>
                                  <span className="text-sm font-medium text-gray-900 ml-2 capitalize">
                                    {hubspotContact.lifecycleStage.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                </div>
                              )}
                              {hubspotContact.phone && (
                                <div>
                                  <span className="text-sm text-gray-600">Phone:</span>
                                  <span className="text-sm font-medium text-gray-900 ml-2">{hubspotContact.phone}</span>
                                </div>
                              )}
                              {hubspotContact.company && (
                                <div className="md:col-span-2">
                                  <span className="text-sm text-gray-600">Company:</span>
                                  <span className="text-sm font-medium text-gray-900 ml-2">
                                    {hubspotContact.company}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : contactError ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">{contactError}</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "conversations" && (
                  <div className="space-y-4">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No conversations found</p>
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                        <div key={conversation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                conversation.user_id ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {conversation.user_id ? "A" : "C"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {conversation.user_id ? "Support Agent" : "Customer"}
                                  </span>
                                  {conversation.from_email && (
                                    <span className="text-xs text-gray-500">({conversation.from_email})</span>
                                  )}
                                </div>
                                
                              </div>
                              <div className="text-sm text-gray-700">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: conversation.body_text || conversation.body || "",
                                  }}
                                />
                              </div>
                              {conversation.attachments && conversation.attachments.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">
                                    {conversation.attachments.length} attachment(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Ticket not found</p>
            </div>
          )}

        
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
