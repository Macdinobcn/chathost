// Tipos principales de Chat Arandai

export type Plan = 'basic' | 'pro' | 'business'

export interface Client {
  id: string
  name: string
  website_url: string
  email: string | null
  plan: Plan
  widget_id: string
  widget_color: string
  widget_name: string
  widget_position: string
  active: boolean
  created_at: string
}

export interface KnowledgeBase {
  id: string
  client_id: string
  content_md: string
  pages_scraped: number
  words_count: number
  last_scraped_at: string
  scraping_status: 'ok' | 'error' | 'pending'
  created_at: string
}

export interface Conversation {
  id: string
  client_id: string
  session_id: string
  visitor_info: Record<string, string> | null
  started_at: string
  last_message_at: string
  message_count: number
  resolved: boolean
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number | null
  cost_eur: number | null
  created_at: string
}
