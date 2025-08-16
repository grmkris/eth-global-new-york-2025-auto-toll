import { Hono } from 'hono'

const app = new Hono()

// Dashboard endpoint
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard - x402 Marketplace</title>
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
    
    /* Wallet management styles */
    .wallet-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .wallet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .wallet-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .wallet-table th {
      text-align: left;
      padding: 0.75rem;
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      color: #495057;
    }
    .wallet-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
      color: #212529;
    }
    .wallet-address {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.875rem;
    }
    .wallet-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-copy {
      background: #6c757d;
      color: white;
    }
    .btn-copy:hover {
      background: #5a6268;
    }
    .btn-fund {
      background: #17a2b8;
      color: white;
    }
    .btn-fund:hover {
      background: #138496;
    }
    .btn-generate {
      background: #28a745;
      color: white;
      padding: 0.75rem 1.5rem;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-generate:hover {
      background: #218838;
    }
    .btn-generate:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }
    .wallet-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }
    .wallet-details {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      word-break: break-all;
    }
    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #dee2e6;
    }
    .tab {
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #6c757d;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.3s;
    }
    .tab.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <h1 style="text-align: center; margin: 2rem 0;">💼 x402 Marketplace Dashboard</h1>
  
  <!-- Tab Navigation -->
  <div class="tabs" style="max-width: 800px; margin: 0 auto;">
    <button class="tab active" onclick="switchTab('wallets')">CDP Wallets</button>
    <button class="tab" onclick="switchTab('register')">Register API</button>
  </div>
  
  <!-- Wallets Tab -->
  <div id="wallets-tab" class="tab-content active">
    <div class="wallet-section">
      <div class="wallet-header">
        <div>
          <h2>💳 CDP Wallets</h2>
          <p style="color: #666; margin-top: 0.5rem;">Manage your payment wallets on Base Sepolia</p>
        </div>
        <button id="generateWalletBtn" class="btn-generate" onclick="generateWallet()">
          Generate New Wallet
        </button>
      </div>
      
      <div id="walletStatus"></div>
      
      <div id="walletList">
        <div class="empty-state">
          <p>Loading wallets...</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Register API Tab -->
  <div id="register-tab" class="tab-content">
    <div class="container">
      <h2>🚀 Register Your API</h2>
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
  </div>
  
  <!-- Wallet Details Modal -->
  <div id="walletModal" class="wallet-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Wallet Details</h3>
        <button class="modal-close" onclick="closeWalletModal()">&times;</button>
      </div>
      <div id="walletModalContent"></div>
    </div>
  </div>

  <script>
    // Tab switching
    window.switchTab = function(tab) {
      const tabs = document.querySelectorAll('.tab');
      const contents = document.querySelectorAll('.tab-content');
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      if (tab === 'wallets') {
        tabs[0].classList.add('active');
        document.getElementById('wallets-tab').classList.add('active');
      } else {
        tabs[1].classList.add('active');
        document.getElementById('register-tab').classList.add('active');
      }
    }
    
    // Load wallets on page load
    window.loadWallets = async function() {
      try {
        const response = await fetch('/api/wallet/list');
        const wallets = await response.json();
        
        const walletList = document.getElementById('walletList');
        
        if (wallets.error) {
          walletList.innerHTML = '<div class="error-message">Failed to load wallets: ' + wallets.error + '</div>';
          return;
        }
        
        if (!wallets || wallets.length === 0) {
          walletList.innerHTML = \`
            <div class="empty-state">
              <p>No wallets created yet</p>
              <p style="font-size: 0.875rem; margin-top: 0.5rem;">Click "Generate New Wallet" to create your first CDP wallet</p>
            </div>
          \`;
          return;
        }
        
        let tableHtml = '<table class="wallet-table"><thead><tr>' +
          '<th>Address</th><th>API Key</th><th>Network</th><th>Balance</th>' +
          '<th>Created</th><th>Actions</th></tr></thead><tbody>';
        
        wallets.forEach(wallet => {
          const createdDate = new Date(wallet.createdAt).toLocaleDateString();
          tableHtml += '<tr>' +
            '<td class="wallet-address">' + wallet.accountAddress.substring(0, 6) + '...' + wallet.accountAddress.substring(38) + '</td>' +
            '<td class="wallet-address">' + wallet.apiKey + '</td>' +
            '<td>' + wallet.network + '</td>' +
            '<td>$' + (wallet.balanceCache || '0') + '</td>' +
            '<td>' + createdDate + '</td>' +
            '<td class="wallet-actions">' +
            '<button class="btn-small btn-copy" onclick="copyToClipboard(&quot;' + wallet.accountAddress + '&quot;, this)">Copy Address</button>' +
            '<button class="btn-small btn-copy" onclick="copyToClipboard(&quot;' + wallet.fullApiKey + '&quot;, this)">Copy API Key</button>' +
            '<button class="btn-small btn-fund" onclick="fundWallet(&quot;' + wallet.fullApiKey + '&quot;)">Fund</button>' +
            '<button class="btn-small btn-copy" onclick="showWalletDetails(&quot;' + wallet.fullApiKey + '&quot;)">Details</button>' +
            '</td></tr>';
        });
        
        tableHtml += '</tbody></table>';
        walletList.innerHTML = tableHtml;
      } catch (error) {
        document.getElementById('walletList').innerHTML = 
          '<div class="error-message">Failed to load wallets: ' + error.message + '</div>';
      }
    }
    
    // Generate new wallet
    window.generateWallet = async function() {
      const btn = document.getElementById('generateWalletBtn');
      const statusDiv = document.getElementById('walletStatus');
      
      btn.disabled = true;
      btn.textContent = 'Generating...';
      statusDiv.innerHTML = '<div class="loading">Creating CDP wallet on Base Sepolia...</div>';
      
      try {
        const response = await fetch('/api/wallet/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create wallet');
        }
        
        statusDiv.innerHTML = '<div class="success-message">' +
          '✅ Wallet created successfully!' +
          '<div class="wallet-details">' +
          '<strong>Address:</strong> ' + data.address + '<br>' +
          '<strong>API Key:</strong> ' + data.apiKey + '<br>' +
          '<strong>Network:</strong> ' + data.network + '<br>' +
          '<strong>Account Name:</strong> ' + data.accountName +
          '</div>' +
          '<button class="copy-btn" onclick="copyToClipboard(&quot;' + data.address + '&quot;, this)" style="margin-top: 1rem;">Copy Address</button>' +
          '<button class="copy-btn" onclick="copyToClipboard(&quot;' + data.apiKey + '&quot;, this)" style="margin-top: 1rem; margin-left: 0.5rem;">Copy API Key</button>' +
          '</div>';
        
        // Reload wallet list
        setTimeout(() => {
          loadWallets();
          statusDiv.innerHTML = '';
        }, 5000);
        
      } catch (error) {
        statusDiv.innerHTML = '<div class="error-message">❌ ' + error.message + '</div>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Generate New Wallet';
      }
    }
    
    // Fund wallet
    window.fundWallet = async function(apiKey) {
      const token = prompt('Which token to request from faucet? (eth or usdc)', 'usdc');
      if (!token) return;
      
      const statusDiv = document.getElementById('walletStatus');
      statusDiv.innerHTML = '<div class="loading">Requesting funds from testnet faucet...</div>';
      
      try {
        const response = await fetch('/api/wallet/fund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fund wallet');
        }
        
        statusDiv.innerHTML = '<div class="success-message">' +
          '✅ Wallet funded successfully with ' + data.amount + '!' +
          '<div class="wallet-details">' +
          '<strong>Transaction Hash:</strong> ' + data.transactionHash + '<br>' +
          '<a href="https://sepolia.basescan.org/tx/' + data.transactionHash + '" target="_blank">View on Explorer</a>' +
          '</div></div>';
        
        setTimeout(() => {
          statusDiv.innerHTML = '';
        }, 5000);
        
      } catch (error) {
        statusDiv.innerHTML = '<div class="error-message">❌ ' + error.message + '</div>';
        setTimeout(() => {
          statusDiv.innerHTML = '';
        }, 5000);
      }
    }
    
    // Show wallet details
    window.showWalletDetails = async function(apiKey) {
      const modal = document.getElementById('walletModal');
      const content = document.getElementById('walletModalContent');
      
      content.innerHTML = '<div class="loading">Loading wallet details...</div>';
      modal.style.display = 'flex';
      
      try {
        const response = await fetch('/api/wallet/info', {
          headers: { 'Authorization': 'Bearer ' + apiKey }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load wallet details');
        }
        
        content.innerHTML = '<div class="wallet-details">' +
          '<p><strong>Address:</strong> ' + data.address + '</p>' +
          '<p><strong>Account Name:</strong> ' + (data.accountName || 'N/A') + '</p>' +
          '<p><strong>Network:</strong> ' + data.network + '</p>' +
          '<p><strong>Balance:</strong> $' + (data.balanceCache || '0') + '</p>' +
          '<p><strong>Total Spent:</strong> $' + (data.totalSpent || '0') + '</p>' +
          '<p><strong>API Calls:</strong> ' + (data.apiCallsCount || 0) + '</p>' +
          '<p><strong>Created:</strong> ' + new Date(data.createdAt).toLocaleString() + '</p>' +
          '<p><strong>Last Used:</strong> ' + (data.lastUsed ? new Date(data.lastUsed).toLocaleString() : 'Never') + '</p>' +
          '</div>' +
          '<div style="margin-top: 1rem;">' +
          '<button class="btn-fund" onclick="fundWallet(&quot;' + apiKey + '&quot;)">Fund Wallet</button>' +
          '<button class="copy-btn" onclick="copyToClipboard(&quot;' + data.address + '&quot;, this)" style="margin-left: 0.5rem;">Copy Address</button>' +
          '</div>';
      } catch (error) {
        content.innerHTML = '<div class="error-message">❌ ' + error.message + '</div>';
      }
    }
    
    // Close wallet modal
    window.closeWalletModal = function() {
      document.getElementById('walletModal').style.display = 'none';
    }
    
    // Copy to clipboard function updated
    window.copyToClipboard = function(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn ? btn.textContent : '';
        if (btn) {
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        }
      });
    }
    
    // Load wallets when page loads
    document.addEventListener('DOMContentLoaded', () => {
      window.loadWallets();
    });
    
    // Original API registration form code
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
    
    window.registerAnother = function() {
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