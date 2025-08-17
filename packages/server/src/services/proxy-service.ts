import type { Endpoint } from '../db/schema'

// Helper to inject auth into request
export async function injectAuth(url: string, options: RequestInit, endpoint: Endpoint) {
  const targetUrl = new URL(url)
  const headers = options.headers as Headers || new Headers()

  // Inject auth based on type
  switch (endpoint.authType) {
    case 'query_param':
      if (endpoint.authKey && endpoint.authValue) {
        targetUrl.searchParams.set(endpoint.authKey, endpoint.authValue)
      }
      break
    case 'header':
      if (endpoint.authKey && endpoint.authValue) {
        headers.set(endpoint.authKey, endpoint.authValue)
      }
      break
    case 'bearer':
      if (endpoint.authValue) {
        headers.set('Authorization', `Bearer ${endpoint.authValue}`)
      }
      break
    case 'none':
      // No auth needed
      break
  }

  return { 
    targetUrl: targetUrl.toString(), 
    options: {
      ...options,
      headers
    }
  }
}