import type { WebSocket } from 'ws'
import type { User } from '../../domain/entities/user.entity.js'

export interface AuthenticatedWebSocket extends WebSocket {
  user: User
}

export interface WSMessage {
  type: string
  channel?: string
  payload?: any
}

export interface SubscribePayload {
  gardenId?: string
  userId?: string
  latitude?: number
  longitude?: number
}

export interface WeatherMessage extends WSMessage {
  channel: 'weather'
  payload?: SubscribePayload
}

export interface CareReminderMessage extends WSMessage {
  channel: 'care-reminders'
  payload?: SubscribePayload
}
