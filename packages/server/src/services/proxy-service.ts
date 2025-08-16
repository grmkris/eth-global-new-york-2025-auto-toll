import type { Endpoint } from '../db/schema'

// Helper to inject auth into request
export async function injectAuth(url: string, options: any, endpoint: Endpoint) {
  const targetUrl = new URL(endpoint.targetUrl)
  const requestUrl = new URL(url)
  
  // Merge query parameters
  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  // Inject auth based on type
  switch (endpoint.authType) {
    case 'query_param':
      if (endpoint.authKey && endpoint.authValue) {
        targetUrl.searchParams.set(endpoint.authKey, endpoint.authValue)
      }
      break
    case 'header':
      if (endpoint.authKey && endpoint.authValue) {
        options.headers = {
          ...options.headers,
          [endpoint.authKey]: endpoint.authValue
        }
      }
      break
    case 'bearer':
      if (endpoint.authValue) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${endpoint.authValue}`
        }
      }
      break
    case 'none':
      // No auth needed
      break
  }

  return { targetUrl: targetUrl.toString(), options }
}