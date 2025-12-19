import type { WebSocket } from 'ws'
import { logger } from '../../config/logger.js'
import { OpenMeteoAdapter } from '../../external-services/open-meteo.adapter.js'
import type { WSMessage } from '../types.js'

// In a real app, this should be injected or singleton
const weatherAdapter = new OpenMeteoAdapter()

export async function handleWeatherMessage(ws: WebSocket, message: WSMessage) {
  try {
    switch (message.type) {
      case 'SUBSCRIBE':
        // In a real implementation, we would store the subscription
        // and push updates. For now, we acknowledge.
        ws.send(
          JSON.stringify({
            type: 'SUBSCRIBED',
            channel: 'weather',
            payload: { gardenId: message.payload?.gardenId },
          }),
        )
        // Simulate immediate update
        if (message.payload?.latitude && message.payload?.longitude) {
          const weather = await weatherAdapter.getCurrentWeather(
            message.payload.latitude,
            message.payload.longitude,
          )

          if (weather.success) {
            ws.send(
              JSON.stringify({
                type: 'WEATHER_UPDATE',
                channel: 'weather',
                payload: weather.data,
              }),
            )
          }
        }
        break

      case 'GET_WEATHER':
        if (message.payload?.latitude && message.payload?.longitude) {
          const weather = await weatherAdapter.getCurrentWeather(
            message.payload.latitude,
            message.payload.longitude,
          )
          if (weather.success) {
            ws.send(
              JSON.stringify({
                type: 'WEATHER_UPDATE',
                channel: 'weather',
                payload: weather.data,
              }),
            )
          } else {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                channel: 'weather',
                payload: { message: weather.error.message },
              }),
            )
          }
        } else {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              channel: 'weather',
              payload: { message: 'Missing location data' },
            }),
          )
        }
        break

      default:
        logger.warn({ type: message.type }, 'Unknown weather message type')
    }
  } catch (error) {
    logger.error({ error }, 'Error in weather handler')
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        channel: 'weather',
        payload: { message: 'Internal server error' },
      }),
    )
  }
}
