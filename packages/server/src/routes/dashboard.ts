import { Hono } from 'hono'

const app = new Hono()

// Dashboard endpoint
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>API Registration - x402 Marketplace</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      width: 100%;
      transition: background 0.3s;
    }
    button:hover { background: #0056b3; }
    button:disabled { 
      background: #ccc; 
      cursor: not-allowed;
    }
    .help-text {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
    }
    .success-message {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    .proxy-url-display {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    .copy-btn {
      background: #28a745;
      padding: 0.5rem 1rem;
      font-size: 14px;
      width: auto;
    }
    .copy-btn:hover { background: #218838; }
    .hidden { display: none; }
    .loading { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Register Your API</h1>
    <p class="subtitle">Make your API available on the x402 Marketplace</p>
    
    <div id="status"></div>
    
    <form id="apiForm">
      <div class="form-group">
        <label for="name">API Name*</label>
        <input type="text" id="name" name="name" required placeholder="e.g., Weather API">
        <div class="help-text">A descriptive name for your API</div>
      </div>
      
      <div class="form-group">
        <label for="targetUrl">Target URL*</label>
        <input type="url" id="targetUrl" name="targetUrl" required placeholder="https://api.example.com/endpoint">
        <div class="help-text">The actual URL of your API endpoint</div>
      </div>
      
      <div class="form-group">
        <label for="authType">Authentication Type*</label>
        <select id="authType" name="authType" required>
          <option value="none">No Authentication</option>
          <option value="bearer">Bearer Token</option>
          <option value="header">API Key (Header)</option>
          <option value="query_param">API Key (Query Parameter)</option>
        </select>
      </div>
      
      <div class="form-group hidden" id="authKeyGroup">
        <label for="authKey">Auth Header/Parameter Name</label>
        <input type="text" id="authKey" name="authKey" placeholder="e.g., X-API-Key or api_key">
        <div class="help-text">The name of the header or query parameter</div>
      </div>
      
      <div class="form-group hidden" id="authValueGroup">
        <label for="authValue">Auth Value*</label>
        <input type="text" id="authValue" name="authValue" placeholder="Your API key or token">
        <div class="help-text">The actual authentication value</div>
      </div>
      
      <div class="form-group">
        <div class="checkbox-group">
          <input type="checkbox" id="requiresPayment" name="requiresPayment" checked>
          <label for="requiresPayment" style="margin-bottom: 0;">Requires Payment</label>
        </div>
        <div class="help-text">Check if users should pay to use your API</div>
      </div>
      
      <div class="form-group" id="priceGroup">
        <label for="price">Price per Call</label>
        <input type="text" id="price" name="price" value="$0.001" placeholder="$0.001">
        <div class="help-text">Price in USD per API call</div>
      </div>
      
      <div class="form-group" id="walletGroup">
        <label for="walletAddress">Wallet Address*</label>
        <input type="text" id="walletAddress" name="walletAddress" placeholder="0x..." required>
        <div class="help-text">Your wallet address to receive payments</div>
      </div>
      
      <button type="submit" id="submitBtn">Register API</button>
    </form>
    
    <div id="result" class="hidden"></div>
  </div>

  <script>
    const form = document.getElementById('apiForm');
    const authType = document.getElementById('authType');
    const authKeyGroup = document.getElementById('authKeyGroup');
    const authValueGroup = document.getElementById('authValueGroup');
    const requiresPayment = document.getElementById('requiresPayment');
    const priceGroup = document.getElementById('priceGroup');
    const walletGroup = document.getElementById('walletGroup');
    const status = document.getElementById('status');
    const result = document.getElementById('result');
    
    // Toggle auth fields based on auth type
    authType.addEventListener('change', () => {
      const value = authType.value;
      if (value === 'none') {
        authKeyGroup.classList.add('hidden');
        authValueGroup.classList.add('hidden');
        document.getElementById('authKey').removeAttribute('required');
        document.getElementById('authValue').removeAttribute('required');
      } else if (value === 'bearer') {
        authKeyGroup.classList.add('hidden');
        authValueGroup.classList.remove('hidden');
        document.getElementById('authKey').removeAttribute('required');
        document.getElementById('authValue').setAttribute('required', '');
      } else {
        authKeyGroup.classList.remove('hidden');
        authValueGroup.classList.remove('hidden');
        document.getElementById('authKey').setAttribute('required', '');
        document.getElementById('authValue').setAttribute('required', '');
      }
    });
    
    // Toggle payment fields
    requiresPayment.addEventListener('change', () => {
      if (requiresPayment.checked) {
        priceGroup.classList.remove('hidden');
        walletGroup.classList.remove('hidden');
        document.getElementById('walletAddress').setAttribute('required', '');
      } else {
        priceGroup.classList.add('hidden');
        walletGroup.classList.add('hidden');
        document.getElementById('walletAddress').removeAttribute('required');
      }
    });
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';
      status.innerHTML = '';
      result.classList.add('hidden');
      
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        targetUrl: formData.get('targetUrl'),
        authType: formData.get('authType'),
        requiresPayment: requiresPayment.checked
      };
      
      // Add auth fields if needed
      if (data.authType !== 'none') {
        if (data.authType === 'bearer') {
          data.authValue = formData.get('authValue');
        } else {
          data.authKey = formData.get('authKey');
          data.authValue = formData.get('authValue');
        }
      }
      
      // Add payment fields if needed
      if (data.requiresPayment) {
        data.price = formData.get('price');
        data.walletAddress = formData.get('walletAddress');
      }
      
      try {
        const response = await fetch('/endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to register API');
        }
        
        // Show success message
        status.innerHTML = '<div class="success-message">✅ API registered successfully!</div>';
        
        // Show proxy URL with copy button
        const proxyUrl = window.location.origin + responseData.proxy_url;
        result.innerHTML = \`
          <h3>Your API is now available at:</h3>
          <div class="proxy-url-display">
            <span>\${proxyUrl}</span>
            <button class="copy-btn" onclick="copyToClipboard('\${proxyUrl}')">Copy URL</button>
          </div>
          <button onclick="registerAnother()">Register Another API</button>
        \`;
        result.classList.remove('hidden');
        
        // Hide form
        form.style.display = 'none';
        
      } catch (error) {
        status.innerHTML = \`<div class="error-message">❌ \${error.message}</div>\`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register API';
      }
    });
    
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    }
    
    function registerAnother() {
      form.reset();
      form.style.display = 'block';
      result.classList.add('hidden');
      status.innerHTML = '';
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').textContent = 'Register API';
      
      // Reset visibility of conditional fields
      authType.dispatchEvent(new Event('change'));
      requiresPayment.dispatchEvent(new Event('change'));
    }
  </script>
</body>
</html>
  `)
})

export default app