// Ethereum Weather - Live Network Visualization
// Turns blockchain activity into beautiful animated weather

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// RPC endpoints for different chains
const RPC_ENDPOINTS = {
    ethereum: 'https://eth.public-rpc.com',
    base: 'https://mainnet.base.org',
    arbitrum: 'https://arb1.arbitrum.io/rpc',
    optimism: 'https://mainnet.optimism.io'
};

let currentChain = 'base';
let soundEnabled = false;

// Weather state
let weatherState = {
    gasPrice: 0,
    blockUsage: 0,
    intensity: 0, // 0-1 overall activity
    temperature: 0, // 0-1 heat/congestion
    windSpeed: 0,
    precipitation: 0,
    condition: 'Clear'
};

// Particles for rain/snow/debris
let particles = [];
// Detect mobile for performance
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const MAX_PARTICLES = isMobile ? 80 : 150;

// Clouds
let clouds = [];
const MAX_CLOUDS = 8;

// Lightning flashes
let lightningFlashes = [];

// Smooth animation
let animationTime = 0;

// Canvas setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Initialize clouds
function initClouds() {
    clouds = [];
    const cloudCount = isMobile ? 5 : MAX_CLOUDS;
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.3,
            size: 50 + Math.random() * 150,
            speed: 0.1 + Math.random() * 0.3,  // Slower clouds
            opacity: 0.2 + Math.random() * 0.3
        });
    }
}
initClouds();

// Fetch network data
async function fetchNetworkData() {
    const rpcUrl = RPC_ENDPOINTS[currentChain];
    
    try {
        const payload = [
            { jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 },
            { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: ['latest', false], id: 2 },
            { jsonrpc: '2.0', method: 'eth_feeHistory', params: ['0x5', 'latest', [25, 50, 75]], id: 3 }
        ];
        
        const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        // Parse responses
        const gasPrice = parseInt(data[0]?.result || '0x0', 16) / 1e9; // Convert to gwei
        const block = data[1]?.result;
        const blockNumber = parseInt(block?.number || '0x0', 16);
        const gasUsed = parseInt(block?.gasUsed || '0x0', 16);
        const gasLimit = parseInt(block?.gasLimit || '0x0', 16);
        const blockUsage = gasLimit > 0 ? (gasUsed / gasLimit) * 100 : 0;
        
        // Update weather state
        updateWeatherState(gasPrice, blockUsage, blockNumber);
        
    } catch (error) {
        console.error('Failed to fetch network data:', error);
    }
}

// Map network metrics to weather
function updateWeatherState(gasPrice, blockUsage, blockNumber) {
    // Smooth transitions using exponential moving average
    const alpha = 0.2;
    
    // Gas price determines "temperature" and storm intensity
    // Base typically has low gas, Ethereum can spike high
    const gasFactor = Math.min(gasPrice / (currentChain === 'ethereum' ? 50 : 0.01), 1);
    weatherState.temperature = weatherState.temperature * (1 - alpha) + gasFactor * alpha;
    
    // Block usage determines wind and precipitation
    const usageFactor = blockUsage / 100;
    weatherState.blockUsage = blockUsage;
    weatherState.windSpeed = weatherState.windSpeed * (1 - alpha) + usageFactor * alpha;
    weatherState.precipitation = weatherState.precipitation * (1 - alpha) + usageFactor * alpha;
    
    // Overall intensity (0-1)
    weatherState.intensity = (weatherState.temperature + weatherState.windSpeed) / 2;
    
    // Determine weather condition
    if (weatherState.intensity < 0.2) {
        weatherState.condition = 'Clear';
    } else if (weatherState.intensity < 0.4) {
        weatherState.condition = 'Partly Cloudy';
    } else if (weatherState.intensity < 0.6) {
        weatherState.condition = 'Cloudy';
    } else if (weatherState.intensity < 0.8) {
        weatherState.condition = 'Rainy';
    } else {
        weatherState.condition = 'Stormy';
    }
    
    // Occasional lightning during high activity
    if (weatherState.intensity > 0.7 && Math.random() < 0.02) {
        triggerLightning();
    }
    
    // Update UI
    document.getElementById('gas-price').textContent = gasPrice.toFixed(4) + ' gwei';
    document.getElementById('block-usage').textContent = blockUsage.toFixed(1) + '%';
    document.getElementById('block-number').textContent = blockNumber.toLocaleString();
    document.getElementById('weather-condition').textContent = weatherState.condition;
    document.getElementById('weather-label').textContent = weatherState.condition;
    
    weatherState.gasPrice = gasPrice;
}

// Lightning effect
function triggerLightning() {
    lightningFlashes.push({
        time: 0,
        duration: 150,
        intensity: 0.3 + Math.random() * 0.5
    });
}

// Create particle
function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: -10,
        speedY: 1 + weatherState.intensity * 3,  // Slower
        speedX: (Math.random() - 0.5) * weatherState.windSpeed * 1.5,  // Less horizontal movement
        size: isMobile ? 1 : 0.8,
        length: isMobile ? 8 : 12,
        opacity: 0.15 + Math.random() * 0.25
    };
}

// Update particles
function updateParticles(deltaTime) {
    const targetParticleCount = Math.floor(weatherState.precipitation * MAX_PARTICLES);
    
    // Add particles gradually (max 2 per frame)
    let addCount = 0;
    while (particles.length < targetParticleCount && addCount < 2) {
        particles.push(createParticle());
        addCount++;
    }
    
    // Normalize deltaTime to prevent huge jumps on mobile
    const normalizedDelta = Math.min(deltaTime / 16.67, 2);
    
    // Update and remove particles
    particles = particles.filter(p => {
        p.y += p.speedY * normalizedDelta;
        p.x += p.speedX * normalizedDelta;
        
        // Remove off-screen particles
        if (p.y > canvas.height || p.x < -10 || p.x > canvas.width + 10) {
            return false;
        }
        return true;
    });
}

// Draw sky gradient
function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    // Sky color based on intensity
    let topColor, bottomColor;
    
    if (weatherState.intensity < 0.3) {
        // Clear sky
        topColor = `rgba(15, 32, 60, 1)`;
        bottomColor = `rgba(30, 60, 100, 1)`;
    } else if (weatherState.intensity < 0.6) {
        // Cloudy
        topColor = `rgba(40, 50, 70, 1)`;
        bottomColor = `rgba(60, 70, 90, 1)`;
    } else {
        // Stormy
        topColor = `rgba(20, 25, 40, 1)`;
        bottomColor = `rgba(35, 40, 55, 1)`;
    }
    
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw clouds
function drawClouds(deltaTime) {
    const normalizedDelta = Math.min(deltaTime / 16.67, 2);
    
    clouds.forEach(cloud => {
        // Update position (slower on mobile)
        cloud.x += cloud.speed * (0.3 + weatherState.windSpeed * 0.5) * normalizedDelta;
        if (cloud.x > canvas.width + cloud.size) {
            cloud.x = -cloud.size;
        }
        
        // Cloud opacity based on intensity
        const opacity = cloud.opacity * (0.5 + weatherState.intensity * 0.5);
        
        // Draw cloud as soft blurred circles
        ctx.save();
        ctx.filter = isMobile ? 'blur(30px)' : 'blur(40px)';
        
        const layers = isMobile ? 2 : 3;
        for (let i = 0; i < layers; i++) {
            const offsetX = (i - 1) * cloud.size * 0.3;
            const offsetY = (i - 1) * cloud.size * 0.1;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * (0.6 + i * 0.2)})`;
            ctx.beginPath();
            ctx.arc(
                cloud.x + offsetX,
                cloud.y + offsetY,
                cloud.size * (0.7 + i * 0.15),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// Draw particles (rain/snow)
function drawParticles() {
    particles.forEach(p => {
        // Draw as thin lines for rain effect
        ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
        ctx.stroke();
    });
}

// Draw lightning
function drawLightning(deltaTime) {
    lightningFlashes = lightningFlashes.filter(flash => {
        flash.time += deltaTime;
        
        if (flash.time < flash.duration) {
            const alpha = 1 - (flash.time / flash.duration);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * flash.intensity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Lightning bolt
            if (Math.random() < 0.3) {
                ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
                ctx.lineWidth = 2 + Math.random() * 3;
                ctx.beginPath();
                const startX = Math.random() * canvas.width;
                ctx.moveTo(startX, 0);
                
                let currentX = startX;
                let currentY = 0;
                
                for (let i = 0; i < 8; i++) {
                    currentX += (Math.random() - 0.5) * 50;
                    currentY += canvas.height / 8;
                    ctx.lineTo(currentX, currentY);
                }
                ctx.stroke();
            }
            
            return true;
        }
        return false;
    });
}

// Main render loop
let lastTime = Date.now();
function render() {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    
    animationTime += deltaTime / 1000;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw layers
    drawSky();
    drawClouds(deltaTime);
    updateParticles(deltaTime);
    drawParticles();
    drawLightning(deltaTime);
    
    requestAnimationFrame(render);
}

// Start rendering
render();

// Fetch data every 10 seconds
fetchNetworkData();
setInterval(fetchNetworkData, 10000);

// Controls
document.getElementById('chain-select').addEventListener('change', (e) => {
    currentChain = e.target.value;
    fetchNetworkData();
});

document.getElementById('screenshot-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `ethereum-weather-${currentChain}-${timestamp}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

document.getElementById('sound-btn').addEventListener('click', (e) => {
    soundEnabled = !soundEnabled;
    e.target.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
    // TODO: Implement web audio ambient sounds
});
