import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from './env'

// Import routes
import endpointsRoutes from './routes/endpoints'
import proxyRoutes from './routes/proxy'
import walletRoutes from './routes/wallet'
import dashboardRoutes from './routes/dashboard'

const app = new Hono()

// Enable CORS for all origins
app.use('*', cors())

// Mount routes
app.route('/endpoints', endpointsRoutes) // /endpoints - HTML view, POST for register, /json for JSON list
app.route('/', proxyRoutes) // /proxy/*, /paid-proxy/*
app.route('/api/wallet', walletRoutes) // /api/wallet/create, /api/wallet/info, /api/wallet/fund
app.route('/dashboard', dashboardRoutes) // /dashboard

// Root endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'x402 API Marketplace',
    endpoints: {
      'GET /endpoints': 'Browse all available APIs (HTML view)',
      'POST /endpoints': 'Register new API endpoint',
      'GET /endpoints/json': 'List all APIs (JSON format)',
      'GET /dashboard': 'Web dashboard for wallet creation',
      'POST /api/wallet/create': 'Create CDP wallet for payments',
      'GET /api/wallet/info': 'Get wallet information',
      'POST /api/wallet/fund': 'Fund wallet from faucet (testnet)',
      'ANY /proxy/:id/*': 'Free proxy endpoint',
      'ANY /paid-proxy/:id/*': 'Paid proxy endpoint (x402 payment)'
    },
    quickstart: {
      browse: 'Visit /endpoints to see available APIs',
      register: 'POST to /endpoints to add your API'
    }
  })
})

export default {
  port: env.PORT,
  fetch: app.fetch,
  idleTimeout: 60
}