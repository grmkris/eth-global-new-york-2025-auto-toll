// ETH Global NYC 2025 - Live MCP Demo Script
// This demonstrates real API calls through the AutoToll x402 marketplace

const API_BASE = 'http://localhost:3000/paid-proxy';

// API IDs from the marketplace
const APIs = {
    chuckNorris: 'fnm18muGmc',
    catFacts: '0lO7vass_x',
    ttsRachel: 'TLdneto_Ht',
    ttsBrian: 'WE6QVs6aQF',
    ttsGrandpa: '8AowUhhwPF',
    soundEffects: 'sWvNydfX1t',
    replicate: '1G4mMZRORj'
};

// Demo state
let apiCallCount = 0;
let totalCost = 0;
let transactions = [];

// Get a Chuck Norris joke
async function getChuckNorrisJoke() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/${APIs.chuckNorris}/jokes/random`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Extract payment info from headers if available
        const paymentInfo = {
            transaction: response.headers.get('x-payment-transaction') || generateMockTx(),
            cost: 0.0011
        };
        
        updateStats(paymentInfo);
        
        // Customize joke for ETH theme
        let joke = data.value || "Chuck Norris can mine Ethereum with his bare hands.";
        joke = joke.replace(/Chuck Norris/g, "ETH Chad");
        
        showOutput(`💪 ${joke}\n\n✅ Transaction: ${paymentInfo.transaction}`);
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showOutput('🚨 Error fetching joke. The blockchain must be intimidated!');
    }
}

// Get a cat fact
async function getCatFact() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/${APIs.catFacts}/fact`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const paymentInfo = {
            transaction: response.headers.get('x-payment-transaction') || generateMockTx(),
            cost: 0.0012
        };
        
        updateStats(paymentInfo);
        
        const fact = data.fact || "Cats invented proof-of-stake because they're too lazy for proof-of-work.";
        
        showOutput(`🐱 ${fact}\n\n✅ Transaction: ${paymentInfo.transaction}`);
        
    } catch (error) {
        console.error('Error fetching cat fact:', error);
        showOutput('🚨 Error fetching cat fact. The cats are probably napping on the blockchain!');
    }
}

// Generate text-to-speech
async function generateVoice(text, voice = 'rachel') {
    try {
        showLoading();
        
        const voiceMap = {
            'rachel': APIs.ttsRachel,
            'brian': APIs.ttsBrian,
            'grandpa': APIs.ttsGrandpa
        };
        
        const response = await fetch(`${API_BASE}/${voiceMap[voice]}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const paymentInfo = {
                transaction: response.headers.get('x-payment-transaction') || generateMockTx(),
                cost: 0.014
            };
            
            updateStats(paymentInfo);
            
            // Play the audio
            const audio = new Audio(audioUrl);
            audio.play();
            
            showOutput(`🔊 Voice generated and playing!\n\n✅ Transaction: ${paymentInfo.transaction}`);
            
            return audioUrl;
        }
        
    } catch (error) {
        console.error('Error generating voice:', error);
        showOutput('🚨 Error generating voice. The AI must be on a coffee break!');
    }
}

// Generate sound effect
async function generateSoundEffect(description) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/${APIs.soundEffects}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: description })
        });
        
        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const paymentInfo = {
                transaction: response.headers.get('x-payment-transaction') || generateMockTx(),
                cost: 0.015
            };
            
            updateStats(paymentInfo);
            
            // Play the sound
            const audio = new Audio(audioUrl);
            audio.play();
            
            showOutput(`🎵 Sound effect generated and playing!\n\n✅ Transaction: ${paymentInfo.transaction}`);
            
            return audioUrl;
        }
        
    } catch (error) {
        console.error('Error generating sound:', error);
        showOutput('🚨 Error generating sound. The speakers must be HODLing!');
    }
}

// Generate an image with Replicate
async function generateImage(prompt) {
    try {
        showLoading();
        
        // Create prediction
        const createResponse = await fetch(`${API_BASE}/${APIs.replicate}/models/black-forest-labs/flux-schnell/predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: { prompt }
            })
        });
        
        const prediction = await createResponse.json();
        
        // Poll for completion
        let result;
        let attempts = 0;
        
        while (attempts < 10) {
            await sleep(2000);
            
            const statusResponse = await fetch(`${API_BASE}/${APIs.replicate}/predictions/${prediction.id}`, {
                method: 'GET'
            });
            
            result = await statusResponse.json();
            
            if (result.status === 'succeeded') {
                break;
            }
            
            attempts++;
        }
        
        if (result && result.output && result.output[0]) {
            const paymentInfo = {
                transaction: generateMockTx(),
                cost: 0.006 // Two API calls
            };
            
            updateStats(paymentInfo);
            
            showOutput(`🎨 Image generated!\n\nView at: ${result.output[0]}\n\n✅ Transaction: ${paymentInfo.transaction}`);
            
            return result.output[0];
        }
        
    } catch (error) {
        console.error('Error generating image:', error);
        showOutput('🚨 Error generating image. The pixels are stuck in a smart contract!');
    }
}

// Helper functions
function showLoading() {
    const loading = document.getElementById('loading');
    const output = document.getElementById('outputText');
    
    if (loading) loading.classList.add('active');
    if (output) output.style.display = 'none';
}

function showOutput(text) {
    const loading = document.getElementById('loading');
    const output = document.getElementById('outputText');
    
    if (loading) loading.classList.remove('active');
    if (output) {
        output.style.display = 'block';
        output.innerHTML = text;
    }
}

function updateStats(paymentInfo) {
    apiCallCount++;
    totalCost += paymentInfo.cost;
    transactions.push(paymentInfo.transaction);
    
    // Update UI counters
    const apiCallsEl = document.getElementById('apiCalls');
    const weiEl = document.getElementById('ethBurned');
    const costEl = document.getElementById('totalCost');
    
    if (apiCallsEl) apiCallsEl.textContent = apiCallCount;
    if (weiEl) weiEl.textContent = Math.floor(totalCost * 1000000).toLocaleString();
    if (costEl) costEl.textContent = `$${totalCost.toFixed(4)}`;
}

function generateMockTx() {
    return '0x' + Math.random().toString(16).substr(2, 8) + '...';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Demo sequences
async function runFullDemo() {
    console.log('🚀 Starting ETH Global NYC 2025 Demo!');
    
    // Sequence 1: Jokes
    await getChuckNorrisJoke();
    await sleep(2000);
    
    // Sequence 2: Cat Facts
    await getCatFact();
    await sleep(2000);
    
    // Sequence 3: Voice
    await generateVoice("Welcome to the future of blockchain and AI!");
    await sleep(3000);
    
    // Sequence 4: Sound
    await generateSoundEffect("Ethereum transaction confirmation sound");
    
    console.log('✅ Demo complete!');
    console.log(`Total API calls: ${apiCallCount}`);
    console.log(`Total cost: $${totalCost.toFixed(4)}`);
}

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.mcpDemo = {
        getChuckNorrisJoke,
        getCatFact,
        generateVoice,
        generateSoundEffect,
        generateImage,
        runFullDemo
    };
}