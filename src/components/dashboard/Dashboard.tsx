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
  Settings,
  Heart,
  Trash2,
  Mic,
  Phone,
  AlertCircle,
  Menu,
  X,
  ArrowLeft,
  Edit2,
  Check,
  XIcon
} from 'lucide-react'
import VoiceChat from '../voice/VoiceChat'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Get ElevenLabs configuration from environment variables
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
  const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''

  // Check if OpenAI is configured
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
  const isOpenAIConfigured = !!OPENAI_API_KEY

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation)
      // Close sidebar on mobile when conversation is selected
      setIsSidebarOpen(false)
    }
  }, [activeConversation])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        return
      }

      setConversations(data || [])
      if (data && data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const createNewConversation = async () => {
    if (!user) return

    try {
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
        return
      }

      setConversations(prev => [data, ...prev])
      setActiveConversation(data.id)
      setMessages([])
    } catch (error) {
      console.error('Error creating conversation:', error)
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
    if (!newMessage.trim() || !activeConversation || !user) return

    setLoading(true)
    const userMessage = newMessage.trim()
    setNewMessage('')

    try {
      // Add user message
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
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, userMessageData])

      // Check if this is the first message and update title if needed
      const currentConversation = conversations.find(c => c.id === activeConversation)
      if (currentConversation && currentConversation.title === 'New Conversation' && isOpenAIConfigured) {
        try {
          const newTitle = await generateConversationTitle(userMessage)
          await updateConversationTitle(activeConversation, newTitle)
        } catch (error) {
          console.error('Error generating conversation title:', error)
        }
      }

      // Generate AI response
      if (isOpenAIConfigured) {
        try {
          // Get conversation history for context
          const conversationHistory = [...messages, userMessageData].map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))

          const aiResponse = await generateChatResponse(conversationHistory)
          
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

          if (!aiError) {
            setMessages(prev => [...prev, aiMessageData])
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
      } else {
        // Fallback response when OpenAI is not configured
        const fallbackResponse = "I'm here to support you through this challenging time. While I'm having trouble connecting right now, please know that your feelings are valid and you're not alone in this journey. The NICU experience can be overwhelming, and it's completely normal to feel scared, worried, or confused. Please don't hesitate to reach out to your medical team, a social worker, or counselor if you need immediate support."
        
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
      
      setLoading(false)
    } catch (error) {
      console.error('Error sending message:', error)
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

  const handleVoiceConversationEnd = (summary: string) => {
    // Optionally save the voice conversation summary to the current text conversation
    if (activeConversation && summary) {
      console.log('Voice conversation ended with summary:', summary)
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

  // Check if voice chat is properly configured
  const isVoiceChatConfigured = ELEVENLABS_API_KEY && ELEVENLABS_AGENT_ID

  const handleBackToConversations = () => {
    setActiveConversation(null)
    setMessages([])
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

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-80 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Neomate</span>
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
            <div className="bg-blue-600 p-2 rounded-full">
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
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Text Chat</span>
          </button>
          
          {isVoiceChatConfigured ? (
            <button
              onClick={() => setIsVoiceChatOpen(true)}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Start Voice Chat</span>
            </button>
          ) : (
            <div className="w-full bg-gray-100 border-2 border-dashed border-gray-300 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-500 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Voice Chat Setup Required</span>
              </div>
              <p className="text-xs text-gray-600">
                Add VITE_ELEVENLABS_AGENT_ID to your .env file to enable voice chat
              </p>
            </div>
          )}

          {!isOpenAIConfigured && (
            <div className="w-full bg-amber-100 border-2 border-dashed border-amber-300 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2 text-amber-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">ChatGPT Integration</span>
              </div>
              <p className="text-xs text-amber-600">
                Add VITE_OPENAI_API_KEY to enable AI responses
              </p>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group ${
                activeConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
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
                        className="flex-1 text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
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
      <div className="flex-1 flex flex-col min-w-0">
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
                  
                  <div className="bg-green-600 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">Neomate AI Assistant</h2>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {isOpenAIConfigured ? 'Powered by ChatGPT - Always here to support you' : 'Always here to support you'}
                    </p>
                  </div>
                </div>
                
                {isVoiceChatConfigured && (
                  <button
                    onClick={() => setIsVoiceChatOpen(true)}
                    className="bg-green-600 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span className="hidden sm:inline">Voice Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500 mb-4 px-4">
                    {isOpenAIConfigured 
                      ? "Ask me anything about neonatal care, or just share how you're feeling. I'm here to provide compassionate support and evidence-based information."
                      : "Share how you're feeling or ask questions. I'm here to provide support during your NICU journey."
                    }
                  </p>
                  {isVoiceChatConfigured && (
                    <button
                      onClick={() => setIsVoiceChatOpen(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Try Voice Chat</span>
                    </button>
                  )}
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
                className="lg:hidden mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Menu className="h-5 w-5" />
                <span>Open Menu</span>
              </button>
              
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Neomate</h3>
              <p className="text-gray-500 mb-6 px-4">
                {isOpenAIConfigured 
                  ? "Choose how you'd like to connect with your AI assistant. I'm powered by ChatGPT and specially trained to provide compassionate neonatal care support."
                  : "Choose how you'd like to connect with your AI assistant"
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={createNewConversation}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors block w-full"
                >
                  Start Text Chat
                </button>
                {isVoiceChatConfigured ? (
                  <button
                    onClick={() => setIsVoiceChatOpen(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Start Voice Chat</span>
                  </button>
                ) : (
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 px-6 py-3 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Voice Chat Setup Required</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Add VITE_ELEVENLABS_AGENT_ID to enable voice features
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Chat Modal */}
      {isVoiceChatConfigured && (
        <VoiceChat
          isOpen={isVoiceChatOpen}
          onClose={() => setIsVoiceChatOpen(false)}
          agentId={ELEVENLABS_AGENT_ID}
          onConversationEnd={handleVoiceConversationEnd}
        />
      )}
    </div>
  )
}