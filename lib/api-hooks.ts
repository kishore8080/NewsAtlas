import { apiConfig, EventTrackingPayload, EventTrackingResponse } from './api-config'

export async function trackEvents(payload: EventTrackingPayload): Promise<EventTrackingResponse> {
  const response = await fetch(apiConfig.endpoints.trackEvents, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to track events')
  }

  return data
}

export async function unsubscribeEvents(): Promise<EventTrackingResponse> {
  const response = await fetch(apiConfig.endpoints.unsubscribeEvents, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to unsubscribe from events')
  }

  return data
}