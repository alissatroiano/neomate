import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Conversation, Message } from '../../lib/supabase'
import { generateChatResponse, generateConversationTitle } from '../../lib/openai'
import { 
  MessageCircle, 
  Plus, 
  Send, 
  User, 
  Bot, 
  LogOut, 
  Trash2,
  AlertCircle,
  Menu,
  X,
  ArrowLeft,
  Edit2,
  Check,
  XIcon
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Check if Supabase is properly configured
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConnectionError('Supabase is not properly configured. Please check your environment variables.')
      return
    }

    if (user) {
      fetchConversations()
    }
  }, [user, isSupabaseConfigured])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation)
      // Close sidebar on mobile when conversation is selected
      setIsSidebarOpen(false)
    }
  }, [activeConversation])

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations for user:', user?.id)
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        setConnectionError('Failed to load conversations. Please check your connection.')
        return
      }

      console.log(`Fetched ${data?.length || 0} conversations`)
      setConversations(data || [])
      setConnectionError(null)
      
      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConnectionError('Failed to connect to the database.')
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        setConnectionError('Failed to load messages.')
        return
      }

      console.log(`Fetched ${data?.length || 0} messages for conversation ${conversationId}`)
      setMessages(data || [])
      setConnectionError(null)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setConnectionError('Failed to load conversation.')
    }
  }

  const createNewConversation = async () => {
    if (!user) return

    try {
      console.log('Creating new conversation for user:', user.id)
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: user.id,
            title: 'New Conversation',
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        setConnectionError('Failed to create new conversation.')
        return
      }

      console.log('New conversation created:', data.id)
      setConversations(prev => [data, ...prev])
      setActiveConversation(data.id)
      setMessages([])
      setConnectionError(null)
    } catch (error) {
      console.error('Error creating conversation:', error)
      setConnectionError('Failed to create conversation.')
    }
  }

  const updateConversationTitle = async (conversationId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', conversationId)

      if (error) {
        console.error('Error updating conversation title:', error)
        return
      }

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        )
      )
    } catch (error) {
      console.error('Error updating conversation title:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user || loading) return

    setLoading(true)
    const userMessage = newMessage.trim()
    setNewMessage('')
    setConnectionError(null)

    try {
      console.log(`Sending message: "${userMessage}" (${userMessage.length} chars)`)
      console.log(`Current conversation has ${messages.length} messages`)

      // Add user message to database
      const { data: userMessageData, error: userError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: activeConversation,
            content: userMessage,
            role: 'user',
          },
        ])
        .select()
        .single()

      if (userError) {
        console.error('Error sending message:', userError)
        setConnectionError('Failed to send message. Please try again.')
        setNewMessage(userMessage) // Restore the message
        setLoading(false)
        return
      }

      // Update local state immediately
      const updatedMessages = [...messages, userMessageData]
      setMessages(updatedMessages)

      // Check if this is the first message and update title if needed
      const currentConversation = conversations.find(c => c.id === activeConversation)
      if (currentConversation && currentConversation.title === 'New Conversation') {
        try {
          const newTitle = await generateConversationTitle(userMessage)
          await updateConversationTitle(activeConversation, newTitle)
        } catch (error) {
          console.error('Error generating conversation title:', error)
        }
      }

      // Generate AI response using Supabase Edge Function
      try {
        console.log(`Generating AI response for message: ${userMessage}`)
        
        // Prepare conversation history for context - use ALL messages, not just last 6
        const contextMessages = updatedMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))

        console.log(`Sending ${contextMessages.length} messages for context (FULL conversation history)`)
        
        const aiResponse = await generateChatResponse(contextMessages)
        console.log('AI response received:', aiResponse.substring(0, 100) + '...')
        
        // Save AI response to database
        const { data: aiMessageData, error: aiError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: activeConversation,
              content: aiResponse,
              role: 'assistant',
            },
          ])
          .select()
          .single()

        if (!aiError && aiMessageData) {
          setMessages(prev => [...prev, aiMessageData])
          console.log('AI message saved successfully')
        } else {
          console.error('Error saving AI message:', aiError)
          setConnectionError('AI response generated but failed to save.')
        }
      } catch (error) {
        console.error('Error generating AI response:', error)
        // Add fallback response
        const fallbackResponse = "I'm experiencing some technical difficulties right now, but I want you to know that your concerns are valid and important. Please don't hesitate to speak directly with your baby's medical team about any questions or worries you have."
        
        const { data: fallbackMessageData } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: activeConversation,
              content: fallbackResponse,
              role: 'assistant',
            },
          ])
          .select()
          .single()

        if (fallbackMessageData) {
          setMessages(prev => [...prev, fallbackMessageData])
        }
      }
      
    } catch (error) {
      console.error('Error in sendMessage:', error)
      setConnectionError('Failed to send message. Please check your connection.')
      setNewMessage(userMessage) // Restore the message on error
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) {
        console.error('Error deleting conversation:', error)
        return
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (activeConversation === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId)
        setActiveConversation(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleEditTitle = (conversationId: string, currentTitle: string) => {
    setEditingTitle(conversationId)
    setEditTitle(currentTitle)
  }

  const handleSaveTitle = async (conversationId: string) => {
    if (editTitle.trim() && editTitle !== conversations.find(c => c.id === conversationId)?.title) {
      await updateConversationTitle(conversationId, editTitle.trim())
    }
    setEditingTitle(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingTitle(null)
    setEditTitle('')
  }

  const handleBackToConversations = () => {
    setActiveConversation(null)
    setMessages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Show connection error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h2>
            <p className="text-gray-600">
              Supabase environment variables are not properly configured. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm z-50">
          {connectionError}
          <button 
            onClick={() => setConnectionError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${connectionError ? 'mt-10' : ''}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/neomate_logo.png" 
                alt="Neomate" 
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <span className="text-xl font-script text-teal-600">Neomate</span>
                <span className="text-xs text-teal-500 uppercase tracking-wider font-light -mt-1">
                  Neonatal AI Assistant
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={signOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
              {/* Close button for mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-2 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={createNewConversation}
            disabled={!isSupabaseConfigured}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group ${
                activeConversation === conversation.id ? 'bg-teal-50 border-teal-200' : ''
              }`}
              onClick={() => setActiveConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingTitle === conversation.id ? (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(conversation.id)
                          } else if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTitle(conversation.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                {editingTitle !== conversation.id && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTitle(conversation.id, conversation.title)
                      }}
                      className="p-1 text-gray-400 hover:text-teal-500 transition-colors"
                      title="Edit title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conversation.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${connectionError ? 'mt-10' : ''}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Mobile back button */}
                  <button
                    onClick={handleBackToConversations}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  
                  <div className="bg-gradient-to-r from-cyan-500 to-teal-600 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate font-script">Neomate AI Assistant</h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      Always here to support you through your NICU journey
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-teal-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500 mb-4 px-4">
                    Ask me anything about neonatal care, or just share how you're feeling. I'm here to provide compassionate support and evidence-based information.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-teal-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base resize-none"
                  disabled={loading || !isSupabaseConfigured}
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading || !isSupabaseConfigured}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              {/* Mobile menu button when no conversation selected */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Menu className="h-5 w-5" />
                <span>Open Menu</span>
              </button>
              
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2 font-script">Welcome to Neomate</h3>
              <p className="text-gray-500 mb-6 px-4">
                Start a conversation with your AI assistant. I'm specially trained to provide compassionate neonatal care support.
              </p>
              <div className="space-y-3">
                <button
                  onClick={createNewConversation}
                  disabled={!isSupabaseConfigured}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 block w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}