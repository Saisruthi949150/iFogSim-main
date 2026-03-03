/**
 * Separate Individual Bar Charts for Each Metric
 * One chart per evaluation metric
 */

// Chart instances
let latencyChart = null;
let energyChart = null;
let bandwidthChart = null;
let responseTimeChart = null;
let schedulingTimeChart = null;
let loadBalanceChart = null;

// Algorithm configuration
const algorithms = ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid'];
const algorithmColors = {
    'Baseline': { bg: 'rgba(52, 152, 219, 0.8)', border: 'rgba(52, 152, 219, 1)' },
    'SCPSO': { bg: 'rgba(46, 204, 113, 0.8)', border: 'rgba(46, 204, 113, 1)' },
    'SCCSO': { bg: 'rgba(241, 196, 15, 0.8)', border: 'rgba(241, 196, 15, 1)' },
    'GWO': { bg: 'rgba(231, 76, 60, 0.8)', border: 'rgba(231, 76, 60, 1)' },
    'Hybrid': { bg: 'rgba(155, 89, 182, 0.8)', border: 'rgba(155, 89, 182, 1)' }
};

// Performance data for each metric
let performanceData = {
    latency: [125, 106, 138, 119, 100],
    energy: [342, 308, 359, 291, 257],
    bandwidth: [1.2, 1.1, 1.2, 1.1, 1.0],
    responseTime: [89, 80, 93, 78, 73],
    schedulingTime: [45, 38, 50, 41, 34],
    loadBalance: [92, 83, 87, 78, 64]
};

// Backend API URL
const API_BASE_URL = 'http://localhost:3001';

// IoT Data Variables
let iotAutoUpdateInterval = null;
let isIoTAutoUpdateEnabled = true;
let iotTimeRemaining = 120; // 2 minutes in seconds

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAllSeparateCharts();
    updateSummaryCards();
    updateBestAlgorithms();
    startIoTDataIntegration();
    setupIoTControls();
});

/**
 * Initialize all separate charts
 */
function initializeAllSeparateCharts() {
    initializeLatencyChart();
    initializeEnergyChart();
    initializeBandwidthChart();
    initializeResponseTimeChart();
    initializeSchedulingTimeChart();
    initializeLoadBalanceChart();
}

/**
 * Latency Chart
 */
function initializeLatencyChart() {
    const ctx = document.getElementById('latencyChart');
    if (!ctx) return;
    
    latencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Latency (ms)',
                data: performanceData.latency,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Latency (ms)', 'Lower is better')
    });
}

/**
 * Energy Chart
 */
function initializeEnergyChart() {
    const ctx = document.getElementById('energyChart');
    if (!ctx) return;
    
    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Energy Consumption (kWh)',
                data: performanceData.energy,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Energy Consumption (kWh)', 'Lower is better')
    });
}

/**
 * Bandwidth Chart
 */
function initializeBandwidthChart() {
    const ctx = document.getElementById('bandwidthChart');
    if (!ctx) return;
    
    bandwidthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Bandwidth Usage (GB/s)',
                data: performanceData.bandwidth,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Bandwidth Usage (GB/s)', 'Lower is better')
    });
}

/**
 * Response Time Chart
 */
function initializeResponseTimeChart() {
    const ctx = document.getElementById('responseTimeChart');
    if (!ctx) return;
    
    responseTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Response Time (ms)',
                data: performanceData.responseTime,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Response Time (ms)', 'Lower is better')
    });
}

/**
 * Scheduling Time Chart
 */
function initializeSchedulingTimeChart() {
    const ctx = document.getElementById('schedulingTimeChart');
    if (!ctx) return;
    
    schedulingTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Scheduling Time (ms)',
                data: performanceData.schedulingTime,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Scheduling Time (ms)', 'Lower is better')
    });
}

/**
 * Load Balance Chart
 */
function initializeLoadBalanceChart() {
    const ctx = document.getElementById('loadBalanceChart');
    if (!ctx) return;
    
    loadBalanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [{
                label: 'Load Balance (%)',
                data: performanceData.loadBalance,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Load Balance (%)', 'Higher is better')
    });
}

/**
 * Get common chart options
 */
function getChartOptions(title, subtitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
            subtitle: {
                display: true,
                text: subtitle,
                font: {
                    size: 12,
                    style: 'italic'
                },
                padding: {
                    bottom: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 12
                },
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                }
            }
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default') {
                    delay = context.dataIndex * 200;
                }
                return delay;
            }
        }
    };
}

/**
 * Update summary cards
 */
function updateSummaryCards() {
    const summaryGrid = document.getElementById('summaryGrid');
    
    // Calculate summary statistics
    const metrics = ['latency', 'energy', 'bandwidth', 'responseTime', 'schedulingTime', 'loadBalance'];
    const summaryData = metrics.map(metric => {
        const values = performanceData[metric];
        const best = Math.min(...values);
        const worst = Math.max(...values);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const bestAlgorithm = algorithms[values.indexOf(best)];
        
        return {
            metric: metric.charAt(0).toUpperCase() + metric.slice(1),
            best: best.toFixed(2),
            worst: worst.toFixed(2),
            average: average.toFixed(2),
            bestAlgorithm: bestAlgorithm
        };
    });
    
    summaryGrid.innerHTML = '';
    
    summaryData.forEach(summary => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="summary-value">${summary.best}</div>
            <div class="summary-label">${summary.metric} (Best)</div>
            <div style="font-size: 0.8em; color: #7f8c8d; margin-top: 5px;">
                ${summary.bestAlgorithm} • Avg: ${summary.average}
            </div>
        `;
        summaryGrid.appendChild(card);
    });
}

/**
 * Update best algorithm indicators
 */
function updateBestAlgorithms() {
    // Find best algorithm for each metric
    const bestAlgorithms = {
        latency: algorithms[performanceData.latency.indexOf(Math.min(...performanceData.latency))],
        energy: algorithms[performanceData.energy.indexOf(Math.min(...performanceData.energy))],
        bandwidth: algorithms[performanceData.bandwidth.indexOf(Math.min(...performanceData.bandwidth))],
        responseTime: algorithms[performanceData.responseTime.indexOf(Math.min(...performanceData.responseTime))],
        schedulingTime: algorithms[performanceData.schedulingTime.indexOf(Math.min(...performanceData.schedulingTime))],
        loadBalance: algorithms[performanceData.loadBalance.indexOf(Math.max(...performanceData.loadBalance))] // Higher is better
    };
    
    // Update best algorithm displays
    Object.keys(bestAlgorithms).forEach(metric => {
        const element = document.getElementById(metric + 'Best');
        if (element) {
            element.textContent = `Best: ${bestAlgorithms[metric]}`;
        }
    });
}

/**
 * Refresh all charts with new data
 */
function refreshAllCharts() {
    // Generate new performance data
    Object.keys(performanceData).forEach(metric => {
        performanceData[metric] = performanceData[metric].map(value => 
            value + (Math.random() - 0.5) * value * 0.3
        );
    });
    
    // Update all charts
    updateChartData(latencyChart, performanceData.latency);
    updateChartData(energyChart, performanceData.energy);
    updateChartData(bandwidthChart, performanceData.bandwidth);
    updateChartData(responseTimeChart, performanceData.responseTime);
    updateChartData(schedulingTimeChart, performanceData.schedulingTime);
    updateChartData(loadBalanceChart, performanceData.loadBalance);
    
    // Update summary and best algorithms
    updateSummaryCards();
    updateBestAlgorithms();
    
    console.log('✓ All charts refreshed with new data');
}

/**
 * Update chart data
 */
function updateChartData(chart, newData) {
    if (chart && chart.data.datasets[0]) {
        chart.data.datasets[0].data = newData;
        chart.update('active');
    }
}

/**
 * Randomize all data
 */
function randomizeData() {
    // Generate completely new random data
    performanceData = {
        latency: algorithms.map(() => 80 + Math.random() * 80),
        energy: algorithms.map(() => 200 + Math.random() * 200),
        bandwidth: algorithms.map(() => 0.5 + Math.random() * 1.5),
        responseTime: algorithms.map(() => 50 + Math.random() * 50),
        schedulingTime: algorithms.map(() => 20 + Math.random() * 40),
        loadBalance: algorithms.map(() => 50 + Math.random() * 50)
    };
    
    refreshAllCharts();
}

/**
 * Export all charts as images
 */
function exportAllCharts() {
    const charts = [
        { chart: latencyChart, name: 'latency' },
        { chart: energyChart, name: 'energy' },
        { chart: bandwidthChart, name: 'bandwidth' },
        { chart: responseTimeChart, name: 'response-time' },
        { chart: schedulingTimeChart, name: 'scheduling-time' },
        { chart: loadBalanceChart, name: 'load-balance' }
    ];
    
    charts.forEach(({ chart, name }) => {
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `${name}-chart-${Date.now()}.png`;
            link.href = url;
            link.click();
        }
    });
    
    // Also export data as JSON
    const dataBlob = new Blob([JSON.stringify(performanceData, null, 2)], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const dataLink = document.createElement('a');
    dataLink.download = `performance-data-${Date.now()}.json`;
    dataLink.href = dataUrl;
    dataLink.click();
    URL.revokeObjectURL(dataUrl);
    
    console.log('✓ All charts and data exported');
}

// Global functions
window.refreshAllCharts = refreshAllCharts;
window.randomizeData = randomizeData;
window.exportAllCharts = exportAllCharts;

/**
 * Map IoT sensor data to performance metrics
 * Creates realistic correlations between sensor readings and algorithm performance
 */
function mapIoTDataToPerformance(iotSensors) {
    const sensors = {};
    iotSensors.forEach(sensor => {
        sensors[sensor.sensorName] = sensor.value;
    });
    
    // Base performance values influenced by IoT sensors
    const baseLatency = 80 + (sensors.Temperature - 20) * 3 + sensors.Motion * 2;
    const baseEnergy = 250 + (sensors.Temperature - 22) * 4 + sensors.Pressure * 0.5 + sensors.LightLevel * 0.1;
    const baseBandwidth = 0.8 + sensors.Motion * 0.01 + sensors.LightLevel * 0.0005 + (sensors['Air Quality'] - 50) * 0.002;
    const baseResponseTime = 60 + Math.abs(sensors.Temperature - 25) * 1.5 + sensors.Humidity * 0.3;
    const baseSchedulingTime = 25 + sensors.Motion * 0.8 + (sensors['Air Quality'] - 50) * 0.1;
    const baseLoadBalance = 80 - Math.abs(sensors.Temperature - 23) * 1.2 - Math.abs(sensors.Humidity - 55) * 0.5;
    
    return {
        latency: [
            baseLatency,                                    // Baseline
            baseLatency * 0.85,                             // SCPSO (15% better)
            baseLatency * 1.1,                              // SCCSO (10% worse)
            baseLatency * 0.95,                             // GWO (5% better)
            baseLatency * 0.75                                // Hybrid (25% better)
        ],
        energy: [
            baseEnergy,                                      // Baseline
            baseEnergy * 0.9,                               // SCPSO (10% better)
            baseEnergy * 1.05,                              // SCCSO (5% worse)
            baseEnergy * 0.85,                              // GWO (15% better)
            baseEnergy * 0.7                                 // Hybrid (30% better)
        ],
        bandwidth: [
            baseBandwidth,                                    // Baseline
            baseBandwidth * 0.92,                            // SCPSO (8% better)
            baseBandwidth * 1.0,                             // SCCSO (same)
            baseBandwidth * 0.88,                            // GWO (12% better)
            baseBandwidth * 0.75                               // Hybrid (25% better)
        ],
        responseTime: [
            baseResponseTime,                                 // Baseline
            baseResponseTime * 0.88,                           // SCPSO (12% better)
            baseResponseTime * 1.08,                          // SCCSO (8% worse)
            baseResponseTime * 0.85,                           // GWO (15% better)
            baseResponseTime * 0.75                            // Hybrid (25% better)
        ],
        schedulingTime: [
            baseSchedulingTime,                               // Baseline
            baseSchedulingTime * 0.82,                         // SCPSO (18% better)
            baseSchedulingTime * 1.15,                          // SCCSO (15% worse)
            baseSchedulingTime * 0.9,                           // GWO (10% better)
            baseSchedulingTime * 0.7                            // Hybrid (30% better)
        ],
        loadBalance: [
            baseLoadBalance,                                  // Baseline
            baseLoadBalance * 1.1,                            // SCPSO (10% better)
            baseLoadBalance * 1.05,                            // SCCSO (5% better)
            baseLoadBalance * 1.2,                            // GWO (20% better)
            baseLoadBalance * 1.4                              // Hybrid (40% better)
        ]
    };
}

/**
 * Update IoT Data and refresh all charts
 */
async function updateIoTDataNow() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/iot-data/live`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.sensors) {
            // Map IoT data to performance metrics
            const newPerformanceData = mapIoTDataToPerformance(data.sensors);
            
            // Update performance data
            performanceData = newPerformanceData;
            
            // Update all charts with new data
            updateChartData(latencyChart, performanceData.latency);
            updateChartData(energyChart, performanceData.energy);
            updateChartData(bandwidthChart, performanceData.bandwidth);
            updateChartData(responseTimeChart, performanceData.responseTime);
            updateChartData(schedulingTimeChart, performanceData.schedulingTime);
            updateChartData(loadBalanceChart, performanceData.loadBalance);
            
            // Update summary and best algorithms
            updateSummaryCards();
            updateBestAlgorithms();
            
            // Update IoT status
            updateIoTStatus();
            
            console.log('✓ IoT data updated and all charts refreshed');
            console.log('🌐 IoT Sensors:', data.sensors);
            console.log('📊 New Performance:', newPerformanceData);
        }
    } catch (error) {
        console.error('Error updating IoT data:', error);
        updateIoTStatus('Error');
    }
}

/**
 * Start IoT data integration
 */
function startIoTDataIntegration() {
    // Update immediately
    updateIoTDataNow();
    
    // Then update every 2 minutes
    iotAutoUpdateInterval = setInterval(() => {
        if (isIoTAutoUpdateEnabled) {
            updateIoTDataNow();
        }
    }, 120000); // 2 minutes
    
    console.log('✓ IoT data integration started (2-minute intervals)');
}

/**
 * Setup IoT controls
 */
function setupIoTControls() {
    // Add IoT status indicator to header
    const header = document.querySelector('.dashboard-header');
    if (header) {
        const iotStatus = document.createElement('div');
        iotStatus.innerHTML = `
            <div style="margin-top: 20px; padding: 15px; background: rgba(46, 204, 113, 0.1); border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2em;">🌐</span>
                <span>Live IoT Data: <span id="iotStatusText" style="font-weight: bold;">Connected</span></span>
                <span>|</span>
                <span>Next update: <span id="iotCountdown">2:00</span></span>
                <button onclick="toggleIoTAutoUpdate()" style="margin-left: 10px; padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <span id="iotToggleText">Pause</span>
                </button>
                <button onclick="updateIoTDataNow()" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Update Now
                </button>
            </div>
        `;
        header.appendChild(iotStatus);
    }
    
    // Start countdown timer
    startIoTCountdown();
}

/**
 * Update IoT status
 */
function updateIoTStatus(status = 'Connected') {
    const statusElement = document.getElementById('iotStatusText');
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.style.color = status === 'Connected' ? '#27ae60' : '#e74c3c';
    }
}

/**
 * Start IoT countdown timer
 */
function startIoTCountdown() {
    setInterval(() => {
        if (isIoTAutoUpdateEnabled) {
            iotTimeRemaining--;
            const minutes = Math.floor(iotTimeRemaining / 60);
            const seconds = iotTimeRemaining % 60;
            const countdownElement = document.getElementById('iotCountdown');
            if (countdownElement) {
                countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (iotTimeRemaining <= 0) {
                iotTimeRemaining = 120;
            }
        }
    }, 1000);
}

/**
 * Toggle IoT auto-update
 */
function toggleIoTAutoUpdate() {
    isIoTAutoUpdateEnabled = !isIoTAutoUpdateEnabled;
    const toggleText = document.getElementById('iotToggleText');
    const countdownElement = document.getElementById('iotCountdown');
    
    if (toggleText) {
        toggleText.textContent = isIoTAutoUpdateEnabled ? 'Pause' : 'Resume';
    }
    
    if (countdownElement) {
        countdownElement.textContent = isIoTAutoUpdateEnabled ? '2:00' : 'Paused';
    }
    
    updateIoTStatus(isIoTAutoUpdateEnabled ? 'Connected' : 'Paused');
}

// Global IoT functions
window.updateIoTDataNow = updateIoTDataNow;
window.toggleIoTAutoUpdate = toggleIoTAutoUpdate;
