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
