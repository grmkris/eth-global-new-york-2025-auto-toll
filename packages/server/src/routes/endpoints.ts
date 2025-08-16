import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { db } from '../db/index'
import { endpoints } from '../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono()

// Display all endpoints in HTML format
app.get('/', async (c) => {
  try {
    // Get all endpoints from database
    const endpointsList = await db.select().from(endpoints).orderBy(endpoints.createdAt)
    
    return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>API Marketplace - Available Endpoints</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      opacity: 0.9;
      font-size: 1.1rem;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-top: 1.5rem;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
    }
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 2rem;
    }
    .search-box {
      margin-bottom: 2rem;
      position: relative;
    }
    .search-box input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    .search-box input:focus {
      outline: none;
      border-color: #667eea;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #f5f5f5;
    }
    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .endpoint-name {
      font-weight: 600;
      color: #333;
    }
    .proxy-url {
      font-family: 'Consolas', 'Monaco', monospace;
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .proxy-url:hover {
      background: #e0e0e0;
    }
    .copy-icon {
      color: #666;
      font-size: 0.8rem;
    }
    .price-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-block;
    }
    .price-free {
      background: #d4edda;
      color: #155724;
    }
    .price-paid {
      background: #fff3cd;
      color: #856404;
    }
    .wallet-address {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.8rem;
      color: #666;
      word-break: break-all;
    }
    .timestamp {
      color: #999;
      font-size: 0.9rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }
    .empty-state h2 {
      color: #666;
      margin-bottom: 1rem;
    }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #333;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s;
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 API Marketplace</h1>
      <p>Browse and connect to available API endpoints</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${endpointsList.length}</div>
          <div class="stat-label">Total APIs</div>
        </div>
        <div class="stat">
          <div class="stat-value">${endpointsList.filter(e => !e.requiresPayment).length}</div>
          <div class="stat-label">Free APIs</div>
        </div>
        <div class="stat">
          <div class="stat-value">${endpointsList.filter(e => e.requiresPayment).length}</div>
          <div class="stat-label">Paid APIs</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      ${endpointsList.length > 0 ? `
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Search APIs by name, URL, or wallet address...">
        </div>
        
        <table id="endpointsTable">
          <thead>
            <tr>
              <th>API Name</th>
              <th>Proxy URL</th>
              <th>Price</th>
              <th>Wallet Address</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${endpointsList.map(endpoint => `
              <tr data-search="${endpoint.name} ${endpoint.targetUrl} ${endpoint.walletAddress || ''}">
                <td>
                  <div class="endpoint-name">${endpoint.name}</div>
                  <div style="font-size: 0.8rem; color: #999; margin-top: 0.25rem;">
                    ${endpoint.targetUrl}
                  </div>
                </td>
                <td>
                  <span class="proxy-url" onclick="copyToClipboard('${endpoint.requiresPayment ? `/paid-proxy/${endpoint.id}` : `/proxy/${endpoint.id}`}')">
                    ${endpoint.requiresPayment ? `/paid-proxy/${endpoint.id}` : `/proxy/${endpoint.id}`}
                    <span class="copy-icon">📋</span>
                  </span>
                </td>
                <td>
                  ${endpoint.requiresPayment 
                    ? `<span class="price-badge price-paid">${endpoint.price}</span>`
                    : `<span class="price-badge price-free">FREE</span>`
                  }
                </td>
                <td>
                  ${endpoint.walletAddress && endpoint.walletAddress !== '0x0000000000000000000000000000000000000000' 
                    ? `<div class="wallet-address">${endpoint.walletAddress}</div>`
                    : `<span style="color: #ccc;">-</span>`
                  }
                </td>
                <td>
                  <div class="timestamp">${new Date(endpoint.createdAt).toLocaleDateString()}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div class="empty-state">
          <h2>No APIs Available</h2>
          <p>Start by registering your first API endpoint</p>
        </div>
      `}
    </div>
  </div>
  
  <div id="toast" class="toast">URL copied to clipboard!</div>

  <script>
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('endpointsTable');
    
    if (searchInput && table) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const searchData = row.getAttribute('data-search').toLowerCase();
          row.style.display = searchData.includes(searchTerm) ? '' : 'none';
        });
      });
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
      const fullUrl = window.location.origin + text;
      navigator.clipboard.writeText(fullUrl).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 2000);
      });
    }
  </script>
</body>
</html>
    `)
  } catch (error) {
    console.error('Error fetching endpoints:', error)
    return c.html(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h1>Error</h1>
          <p>Failed to load endpoints. Please try again later.</p>
        </body>
      </html>
    `, 500)
  }
})

// Register new API endpoint - POST /endpoints
app.post('/', async (c) => {
  console.log('\n📝 [API REGISTER] New API registration request received')
  
  try {
    const body = await c.req.json()
    const { name, targetUrl, authType, authKey, authValue, walletAddress, price = "$0.001", requiresPayment = true } = body

    console.log(`📌 [API REGISTER] Registering API: ${name}`)
    console.log(`   🔗 Target: ${targetUrl}`)
    console.log(`   💰 Price: ${requiresPayment ? price : 'FREE'}`)
    console.log(`   🔐 Auth: ${authType}`)

    if (!name || !targetUrl || !authType) {
      console.error('❌ [API REGISTER] Missing required fields')
      return c.json({ error: "Missing required fields: name, targetUrl, authType" }, 400)
    }

    const id = nanoid(10)
    console.log(`   🆔 Generated ID: ${id}`)
    
    if (requiresPayment && walletAddress) {
      console.log(`   📍 Payments to: ${walletAddress}`)
    }
    
    // Insert into database
    await db.insert(endpoints).values({
      id,
      name,
      targetUrl,
      authType,
      authKey,
      authValue,
      walletAddress,
      price,
      requiresPayment
    })

    // No need for old payment config anymore

    const proxyUrl = requiresPayment ? `/paid-proxy/${id}` : `/proxy/${id}`
    console.log(`✅ [API REGISTER] API registered successfully!`)
    console.log(`   🚀 Proxy URL: ${proxyUrl}`)
    
    return c.json({
      id,
      proxy_url: proxyUrl,
      message: `API registered successfully${requiresPayment ? ' (payment required)' : ' (free)'}`
    })
  } catch (error) {
    console.error('❌ [API REGISTER] Failed to register endpoint:', error)
    return c.json({ error: "Failed to register endpoint" }, 500)
  }
})

// List all registered APIs as JSON - GET /endpoints/json
app.get('/json', async (c) => {
  try {
    // Get endpoints from database
    const endpointsList = await db.select({
      id: endpoints.id,
      name: endpoints.name,
      targetUrl: endpoints.targetUrl,
      walletAddress: endpoints.walletAddress,
      price: endpoints.price,
      requiresPayment: endpoints.requiresPayment,
      createdAt: endpoints.createdAt
    }).from(endpoints)

    return c.json(endpointsList.map(e => ({
      id: e.id,
      name: e.name,
      proxy_url: e.requiresPayment ? `/paid-proxy/${e.id}` : `/proxy/${e.id}`,
      wallet_address: e.walletAddress,
      price: e.price,
      requires_payment: e.requiresPayment
    })))
  } catch (error) {
    return c.json({ error: "Failed to list endpoints" }, 500)
  }
})

export default app