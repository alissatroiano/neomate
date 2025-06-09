import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, Conversation, Message } from '../../lib/supabase'
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
  Phone
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

  // Get ElevenLabs agent ID from environment variables
  const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || ''

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation)
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
        return
      }

      setMessages(prev => [...prev, userMessageData])

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse = generateAIResponse(userMessage)
        
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
        
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
      setLoading(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand this is a challenging time for you and your family. Your feelings are completely valid, and I'm here to support you through this journey.",
      "Thank you for sharing that with me. In the NICU, it's normal to feel overwhelmed. Would you like me to explain what some of the monitors and equipment do?",
      "Your baby is receiving excellent care from the medical team. It's important to take care of yourself too during this time. Have you been able to rest?",
      "Many parents in the NICU experience similar concerns. You're not alone in feeling this way. Would you like some strategies for managing stress and anxiety?",
      "That's a great question about your baby's care. The medical team is monitoring everything closely. Is there something specific you'd like me to help explain?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
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
      // You could add the summary as a message or create a new conversation
      console.log('Voice conversation ended with summary:', summary)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Neomate</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
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
          
          {ELEVENLABS_AGENT_ID && (
            <button
              onClick={() => setIsVoiceChatOpen(true)}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Start Voice Chat</span>
            </button>
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conversation.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Neomate AI Assistant</h2>
                    <p className="text-sm text-gray-500">Always here to support you</p>
                  </div>
                </div>
                
                {ELEVENLABS_AGENT_ID && (
                  <button
                    onClick={() => setIsVoiceChatOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Voice Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500 mb-4">Ask me anything about neonatal care, or just share how you're feeling.</p>
                  {ELEVENLABS_AGENT_ID && (
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
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
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
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Neomate</h3>
              <p className="text-gray-500 mb-6">Choose how you'd like to connect with your AI assistant</p>
              <div className="space-y-3">
                <button
                  onClick={createNewConversation}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors block w-full"
                >
                  Start Text Chat
                </button>
                {ELEVENLABS_AGENT_ID && (
                  <button
                    onClick={() => setIsVoiceChatOpen(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Start Voice Chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Chat Modal */}
      {ELEVENLABS_AGENT_ID && (
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