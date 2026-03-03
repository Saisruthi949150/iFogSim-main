/**
 * Unified Live IoT Algorithm Dashboard
 * All charts together with live data integration
 */

// Chart instances
let latencyChart = null;
let energyChart = null;
let bandwidthChart = null;
let responseTimeChart = null;
let schedulingTimeChart = null;
let loadBalanceChart = null;
let flChart = null;

// Algorithm configuration
const algorithms = ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid'];
const algorithmColors = {
    'Baseline': { bg: 'rgba(52, 152, 219, 0.8)', border: 'rgba(52, 152, 219, 1)' },
    'SCPSO': { bg: 'rgba(46, 204, 113, 0.8)', border: 'rgba(46, 204, 113, 1)' },
    'SCCSO': { bg: 'rgba(241, 196, 15, 0.8)', border: 'rgba(241, 196, 15, 1)' },
    'GWO': { bg: 'rgba(231, 76, 60, 0.8)', border: 'rgba(231, 76, 60, 1)' },
    'Hybrid': { bg: 'rgba(155, 89, 182, 0.8)', border: 'rgba(155, 89, 182, 1)' }
};

// Backend API URL
const API_BASE_URL = 'http://localhost:3001';

// IoT Data Variables
let iotAutoUpdateInterval = null;
let isIoTAutoUpdateEnabled = true;
let iotTimeRemaining = 120; // 2 minutes in seconds

// Performance data
let performanceData = {
    latency: [125, 106, 138, 119, 100],
    energy: [342, 308, 359, 291, 257],
    bandwidth: [1.2, 1.1, 1.2, 1.1, 1.0],
    responseTime: [89, 80, 93, 78, 73],
    schedulingTime: [45, 38, 50, 41, 34],
    loadBalance: [92, 83, 87, 78, 64],
    flAccuracy: [85.2, 88.7, 91.3, 94.2, 96.8],
    flNodes: [3, 4, 5, 6, 6, 7],
    flRounds: [8, 10, 12, 12, 12]
};

// Current IoT sensor data
let currentIoTData = {
    temperature: 24.5,
    humidity: 65,
    pressure: 1013,
    light: 450,
    motion: 12,
    airQuality: 85
};

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAllCharts();
    updateSummaryCards();
    startIoTDataIntegration();
    setupEventListeners();
});

/**
 * Initialize all charts
 */
function initializeAllCharts() {
    initializeLatencyChart();
    initializeEnergyChart();
    initializeBandwidthChart();
    initializeResponseTimeChart();
    initializeSchedulingTimeChart();
    initializeLoadBalanceChart();
    initializeFLChart();
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
                borderRadius: 6,
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
                label: 'Energy (kWh)',
                data: performanceData.energy,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Energy (kWh)', 'Lower is better')
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
                label: 'Bandwidth (GB/s)',
                data: performanceData.bandwidth,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Bandwidth (GB/s)', 'Lower is better')
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
                borderRadius: 6,
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
                borderRadius: 6,
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
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: getChartOptions('Load Balance (%)', 'Higher is better')
    });
}

/**
 * Federated Learning Chart
 */
function initializeFLChart() {
    const ctx = document.getElementById('flChart');
    if (!ctx) return;
    
    flChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6', 'Round 7', 'Round 8', 'Round 9', 'Round 10'],
            datasets: [
                {
                    label: 'Model Accuracy (%)',
                    data: [85.2, 87.5, 89.1, 90.8, 92.3, 93.7, 94.8, 95.6, 96.2, 96.8],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Convergence Rate',
                    data: [0.65, 0.72, 0.78, 0.83, 0.87, 0.91, 0.94, 0.96, 0.98, 0.99],
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                },
                {
                    label: 'Privacy Score',
                    data: [92, 93, 94, 94, 95, 95, 96, 96, 97, 97],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
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
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.label === 'Model Accuracy (%)') {
                                    label += context.parsed.y.toFixed(1) + '%';
                                } else {
                                    label += context.parsed.y.toFixed(2);
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    max: 1,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Rate/Score',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Training Rounds',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
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
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };
}

/**
 * Update summary cards
 */
function updateSummaryCards() {
    // Update temperature
    const tempElement = document.getElementById('tempSummary');
    if (tempElement) {
        tempElement.textContent = currentIoTData.temperature.toFixed(1) + '°C';
    }
    
    // Update best algorithm
    const bestAlgoElement = document.getElementById('bestAlgorithm');
    if (bestAlgoElement) {
        const bestAlgo = calculateBestAlgorithm();
        bestAlgoElement.textContent = bestAlgo;
    }
    
    // Update system load
    const loadElement = document.getElementById('systemLoad');
    if (loadElement) {
        const avgLoad = calculateAverageLoad();
        loadElement.textContent = avgLoad.toFixed(0) + '%';
    }
}

/**
 * Calculate best algorithm
 */
function calculateBestAlgorithm() {
    const scores = algorithms.map((algo, index) => {
        const latencyScore = performanceData.latency[index];
        const energyScore = performanceData.energy[index];
        const responseScore = performanceData.responseTime[index];
        const schedulingScore = performanceData.schedulingTime[index];
        const loadScore = 100 - performanceData.loadBalance[index]; // Higher is better
        
        // Normalize and combine scores
        const totalScore = latencyScore + energyScore + responseScore + schedulingScore + loadScore;
        return { algorithm: algo, score: totalScore };
    });
    
    scores.sort((a, b) => a.score - b.score);
    return scores[0].algorithm;
}

/**
 * Calculate average system load
 */
function calculateAverageLoad() {
    const loads = [
        (performanceData.latency[0] / 150) * 100, // Normalize latency
        (performanceData.energy[0] / 400) * 100,   // Normalize energy
        (performanceData.bandwidth[0] / 2) * 100,    // Normalize bandwidth
        (performanceData.responseTime[0] / 100) * 100, // Normalize response time
        (performanceData.schedulingTime[0] / 50) * 100, // Normalize scheduling
        performanceData.loadBalance[0]                 // Load balance as-is
    ];
    
    return loads.reduce((a, b) => a + b, 0) / loads.length;
}

/**
 * Map IoT sensor data to performance metrics
 */
function mapIoTDataToPerformance(iotSensors) {
    const sensors = {};
    iotSensors.forEach(sensor => {
        sensors[sensor.sensorName] = sensor.value;
    });
    
    // Update current IoT data
    currentIoTData = {
        temperature: sensors.Temperature || currentIoTData.temperature,
        humidity: sensors.Humidity || currentIoTData.humidity,
        pressure: sensors.Pressure || currentIoTData.pressure,
        light: sensors['Light Level'] || currentIoTData.light,
        motion: sensors['Motion Detection'] || currentIoTData.motion,
        airQuality: sensors['Air Quality'] || currentIoTData.airQuality
    };
    
    // Base performance values influenced by IoT sensors
    const baseLatency = 80 + (currentIoTData.temperature - 20) * 2 + currentIoTData.motion * 1.5;
    const baseEnergy = 250 + (currentIoTData.temperature - 22) * 3 + currentIoTData.pressure * 0.3 + currentIoTData.light * 0.05;
    const baseBandwidth = 0.8 + currentIoTData.motion * 0.01 + currentIoTData.light * 0.0005 + (currentIoTData.airQuality - 50) * 0.002;
    const baseResponseTime = 60 + Math.abs(currentIoTData.temperature - 25) * 1.2 + currentIoTData.humidity * 0.3;
    const baseSchedulingTime = 25 + currentIoTData.motion * 0.6 + (currentIoTData.airQuality - 50) * 0.1;
    const baseLoadBalance = 80 - Math.abs(currentIoTData.temperature - 23) * 0.8 - Math.abs(currentIoTData.humidity - 55) * 0.3;
    
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
        ],
        flAccuracy: [
            85 + (100 - currentIoTData.temperature) * 0.1,    // Baseline
            88 + (100 - currentIoTData.temperature) * 0.15,   // SCPSO
            91 + (100 - currentIoTData.temperature) * 0.12,   // SCCSO
            94 + (100 - currentIoTData.temperature) * 0.18,   // GWO
            97 + (100 - currentIoTData.temperature) * 0.2     // Hybrid
        ],
        flNodes: [3, 4, 5, 6, 6],
        flRounds: [8, 10, 12, 12, 12]
    };
}

/**
 * Update IoT Data and refresh all charts
 */
async function updateAllCharts() {
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
            updateFLChartData();
            
            // Update summary cards
            updateSummaryCards();
            updateBestAlgorithmIndicators();
            
            // Update last update time
            document.getElementById('updateTime').textContent = 'Just now';
            
            console.log('✓ Live IoT data updated and all charts refreshed');
            console.log('🌐 IoT Sensors:', data.sensors);
            console.log('📊 New Performance:', newPerformanceData);
        }
    } catch (error) {
        console.error('Error updating IoT data:', error);
    }
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
 * Update FL chart data
 */
function updateFLChartData() {
    if (flChart && flChart.data.datasets) {
        // Generate IoT-based FL data
        const tempFactor = (100 - currentIoTData.temperature) / 100;
        const baseAccuracy = 85 + tempFactor * 10;
        
        // Generate realistic FL progression data
        const rounds = 10;
        const accuracyData = [];
        const convergenceData = [];
        const privacyData = [];
        
        for (let i = 0; i < rounds; i++) {
            const roundProgress = (i + 1) / rounds;
            accuracyData.push(baseAccuracy + (95 - baseAccuracy) * (1 - Math.pow(0.8, i + 1)));
            convergenceData.push(0.6 + 0.35 * (1 - Math.pow(0.85, i + 1)));
            privacyData.push(92 + 5 * roundProgress + Math.random() * 2);
        }
        
        flChart.data.datasets[0].data = accuracyData;    // Model Accuracy
        flChart.data.datasets[1].data = convergenceData; // Convergence Rate
        flChart.data.datasets[2].data = privacyData;     // Privacy Score
        flChart.update('active');
        
        // Update FL accuracy display (show final round accuracy)
        const flAccuracyElement = document.getElementById('flAccuracy');
        if (flAccuracyElement) {
            flAccuracyElement.textContent = accuracyData[accuracyData.length - 1].toFixed(1) + '%';
        }
    }
}

/**
 * Update best algorithm indicators
 */
function updateBestAlgorithmIndicators() {
    const bestAlgo = calculateBestAlgorithm();
    
    // Update best algorithm for each chart
    const indicators = [
        { id: 'latencyBest', algo: bestAlgo },
        { id: 'energyBest', algo: bestAlgo },
        { id: 'bandwidthBest', algo: bestAlgo },
        { id: 'responseTimeBest', algo: bestAlgo },
        { id: 'schedulingTimeBest', algo: bestAlgo },
        { id: 'loadBalanceBest', algo: bestAlgo },
        { id: 'flBest', algo: bestAlgo }
    ];
    
    indicators.forEach(indicator => {
        const element = document.getElementById(indicator.id);
        if (element) {
            element.textContent = `Best: ${indicator.algo}`;
        }
    });
}

/**
 * Start IoT data integration
 */
function startIoTDataIntegration() {
    // Update immediately
    updateAllCharts();
    
    // Then update every 2 minutes
    iotAutoUpdateInterval = setInterval(() => {
        if (isIoTAutoUpdateEnabled) {
            updateAllCharts();
        }
    }, 120000); // 2 minutes
    
    console.log('✓ Live IoT data integration started (2-minute intervals)');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Auto-update countdown
    setInterval(() => {
        if (isIoTAutoUpdateEnabled) {
            const updateTimeElement = document.getElementById('updateTime');
            if (updateTimeElement) {
                const now = new Date();
                const lastUpdate = new Date(now.getTime() - (120 - iotTimeRemaining) * 1000);
                updateTimeElement.textContent = formatTimeDifference(now, lastUpdate);
            }
        }
    }, 1000);
}

/**
 * Format time difference
 */
function formatTimeDifference(now, lastUpdate) {
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 60) {
        return `${diff}s ago`;
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}m ago`;
    } else {
        return `${Math.floor(diff / 3600)}h ago`;
    }
}

/**
 * Toggle auto-update
 */
function toggleAutoUpdate() {
    isIoTAutoUpdateEnabled = !isIoTAutoUpdateEnabled;
    const toggleText = document.getElementById('autoUpdateText');
    if (toggleText) {
        toggleText.textContent = isIoTAutoUpdateEnabled ? '⏸️ Pause Auto' : '▶️ Resume Auto';
    }
    
    console.log(`Auto-update ${isIoTAutoUpdateEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Export data
 */
function exportData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        iotData: currentIoTData,
        performanceData: performanceData,
        bestAlgorithm: calculateBestAlgorithm(),
        systemLoad: calculateAverageLoad()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-iot-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✓ Dashboard data exported');
}

// Global functions
window.updateAllCharts = updateAllCharts;
window.toggleAutoUpdate = toggleAutoUpdate;
window.exportData = exportData;
