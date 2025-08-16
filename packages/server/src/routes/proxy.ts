import { Hono } from 'hono'
import { db } from '../db/index'
import { endpoints } from '../db/schema'
import { eq } from 'drizzle-orm'
import { env } from '../env'
import { paymentMiddleware } from 'x402-hono'
import { injectAuth } from '../services/proxy-service'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

const app = new Hono()

// Free proxy endpoint (for testing)
app.all('/proxy/:id/*', async (c) => {
  const id = c.req.param('id')
  console.log(`\n🔄 [PROXY] Free proxy request to: /proxy/${id}`)
  
  try {
    const path = c.req.path.replace(`/proxy/${id}`, '')
    
    // Get endpoint from DB
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id)
    })

    if (!endpoint) {
      console.error(`❌ [PROXY] Endpoint not found: ${id}`)
      return c.json({ error: "Endpoint not found" }, 404)
    }
    
    console.log(`   📌 API: ${endpoint.name}`)
    console.log(`   🔗 Forwarding to: ${endpoint.targetUrl}${path}`)

    // Build target URL
    const targetUrl = endpoint.targetUrl + path
    
    // Prepare request options
    const options: any = {
      method: c.req.method,
      headers: {}
    }

    // Forward headers (excluding host)
    const headers = c.req.header()
    Object.keys(headers).forEach(key => {
      if (key.toLowerCase() !== 'host') {
        options.headers[key] = headers[key]
      }
    })

    // Forward body if present
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      options.body = await c.req.text()
    }

    // Inject auth
    const { targetUrl: finalUrl, options: finalOptions } = await injectAuth(
      targetUrl,
      options,
      endpoint
    )

    // Make the request
    const response = await fetch(finalUrl, finalOptions)
    
    console.log(`   ✅ Response: ${response.status} ${response.statusText}`)
    
    // Return response
    const responseBody = await response.text()
    return c.text(responseBody, response.status as unknown as ContentfulStatusCode, {
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    })
  } catch (error) {
    console.error("❌ [PROXY] Request failed:", error)
    return c.json({ error: "Proxy request failed" }, 500)
  }
})

// Apply x402 payment middleware for paid endpoints
app.use('/paid-proxy/:id/*', async (c, next) => {
  const id = c.req.param('id')
  console.log(`\n💳 [PAYMENT] x402 payment middleware for: /paid-proxy/${id}`)
  
  if (!id) {
    console.error('❌ [PAYMENT] Invalid endpoint ID')
    return c.json({ error: 'Invalid endpoint' }, 404)
  }
  
  // Get endpoint to find payment recipient
  const endpoint = await db.query.endpoints.findFirst({
    where: eq(endpoints.id, id)
  })
  
  if (!endpoint || !endpoint.requiresPayment || !endpoint.walletAddress) {
    console.log('   ⚠️  [PAYMENT] No payment required for this endpoint')
    return next()
  }
  
  console.log(`   📌 API: ${endpoint.name}`)
  console.log(`   💰 Price: ${endpoint.price}`)
  console.log(`   📍 Recipient: ${endpoint.walletAddress}`)
  
  // Apply x402 payment middleware
  const middleware = paymentMiddleware(
    endpoint.walletAddress,
    {
      [`/paid-proxy/${id}`]: {
        price: endpoint.price,
        network: env.NETWORK,
        config: {
          description: `Payment for ${endpoint.name} API`
        }
      }
    },
    {
      url: env.FACILITATOR_URL
    }
  )
  
  return middleware(c, next)
})

app.all('/paid-proxy/:id/*', async (c) => {
  const id = c.req.param('id')
  console.log(`\n✅ [PAID-PROXY] Payment verified, processing request for: /paid-proxy/${id}`)
  
  try {
    const path = c.req.path.replace(`/paid-proxy/${id}`, '')
    
    // Get endpoint from DB
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id)
    })

    if (!endpoint) {
      console.error(`❌ [PAID-PROXY] Endpoint not found: ${id}`)
      return c.json({ error: "Endpoint not found" }, 404)
    }

    console.log(`   📌 API: ${endpoint.name}`)
    console.log(`   🔗 Forwarding to: ${endpoint.targetUrl}${path}`)
    
    // Payment is now handled by x402 middleware above

    // Build target URL
    const targetUrl = endpoint.targetUrl + path
    
    // Prepare request options
    const options: any = {
      method: c.req.method,
      headers: {}
    }

    // Forward headers (excluding host)
    const headers = c.req.header()
    Object.keys(headers).forEach(key => {
      if (key.toLowerCase() !== 'host') {
        options.headers[key] = headers[key]
      }
    })

    // Forward body if present
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      options.body = await c.req.text()
    }

    // Inject auth
    const { targetUrl: finalUrl, options: finalOptions } = await injectAuth(
      targetUrl,
      options,
      endpoint
    )

    // Make the request
    const response = await fetch(finalUrl, finalOptions)
    
    console.log(`   ✅ Response: ${response.status} ${response.statusText}`)
    
    // Return response
    const responseBody = await response.text()
    return c.text(responseBody, response.status as unknown as ContentfulStatusCode, {
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    })
  } catch (error) {
    console.error("❌ [PROXY] Request failed:", error)
    return c.json({ error: "Proxy request failed" }, 500)
  }
})

export default app