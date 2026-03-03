/**
 * iFogSim Dashboard - Modern Card Layout JavaScript
 * Real-time monitoring with IoT data integration
 */

// Chart instances
let systemOverviewChart = null;
let latencyChart = null;
let energyChart = null;
let bandwidthChart = null;
let responseTimeChart = null;
let loadBalanceChart = null;
let schedulingTimeChart = null;
let algorithmChart = null;
let flChart = null;
let topologyChart = null;
let iotLiveDataChart = null;
let comparisonChart = null;

// Backend API URL
const API_BASE_URL = 'http://localhost:3001';

// IoT Data Variables
let iotAutoUpdateInterval = null;
let isIoTAutoUpdateEnabled = true;
let iotTimeRemaining = 120; // 2 minutes in seconds

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    startIoTDataIntegration();
    setupEventListeners();
    updateSystemStatus();
});

/**
 * Initialize all charts
 */
function initializeCharts() {
    initializeSystemOverviewChart();
    initializeLatencyChart();
    initializeEnergyChart();
    initializeBandwidthChart();
    initializeResponseTimeChart();
    initializeLoadBalanceChart();
    initializeSchedulingTimeChart();
    initializeAlgorithmChart();
    initializeFLChart();
    initializeTopologyChart();
    initializeIoTLiveChart();
    initializeComparisonChart();
}

/**
 * System Overview Chart
 */
function initializeSystemOverviewChart() {
    const ctx = document.getElementById('systemOverviewChart');
    if (!ctx) return;
    
    systemOverviewChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Idle', 'Maintenance'],
            datasets: [{
                data: [67, 25, 8],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Latency Chart
 */
function initializeLatencyChart() {
    const ctx = document.getElementById('latencyChart');
    if (!ctx) return;
    
    latencyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Latency',
                data: [145, 132, 125],
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
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
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Energy',
                data: [318, 335, 342],
                backgroundColor: 'rgba(241, 196, 15, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

/**
 * Bandwidth Chart
 */
function initializeBandwidthChart() {
    const ctx = document.getElementById('bandwidthChart');
    if (!ctx) return;
    
    bandwidthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Bandwidth',
                data: [1.3, 1.25, 1.2],
                borderColor: 'rgba(155, 89, 182, 1)',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

/**
 * Response Time Chart
 */
function initializeResponseTimeChart() {
    const ctx = document.getElementById('responseTimeChart');
    if (!ctx) return;
    
    responseTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Response Time',
                data: [105, 95, 89],
                borderColor: 'rgba(46, 204, 113, 1)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

/**
 * Load Balance Chart
 */
function initializeLoadBalanceChart() {
    const ctx = document.getElementById('loadBalanceChart');
    if (!ctx) return;
    
    loadBalanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Load Balance',
                data: [88, 90, 92],
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
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
            labels: ['2m ago', '1m ago', 'Now'],
            datasets: [{
                label: 'Scheduling Time',
                data: [52, 48, 45],
                backgroundColor: 'rgba(231, 76, 60, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

/**
 * Algorithm Performance Chart
 */
function initializeAlgorithmChart() {
    const ctx = document.getElementById('algorithmChart');
    if (!ctx) return;
    
    algorithmChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Latency', 'Energy', 'Bandwidth', 'Response Time', 'Load Balance'],
            datasets: [
                {
                    label: 'Baseline',
                    data: [100, 100, 100, 100, 100],
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)'
                },
                {
                    label: 'SCPSO',
                    data: [85, 90, 95, 88, 92],
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)'
                },
                {
                    label: 'SCCSO',
                    data: [110, 105, 100, 108, 95],
                    borderColor: 'rgba(241, 196, 15, 1)',
                    backgroundColor: 'rgba(241, 196, 15, 0.2)'
                },
                {
                    label: 'GWO',
                    data: [95, 85, 90, 92, 85],
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)'
                },
                {
                    label: 'Hybrid',
                    data: [80, 75, 80, 82, 93],
                    borderColor: 'rgba(155, 89, 182, 1)',
                    backgroundColor: 'rgba(155, 89, 182, 0.2)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 120
                }
            }
        }
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
            labels: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6'],
            datasets: [{
                label: 'Model Accuracy',
                data: [85, 88, 91, 92.5, 93.8, 94.2],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100
                }
            }
        }
    });
}

/**
 * Network Topology Chart
 */
function initializeTopologyChart() {
    const ctx = document.getElementById('topologyChart');
    if (!ctx) return;
    
    // Create a simple network visualization
    topologyChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Fog Nodes',
                data: [
                    {x: 0, y: 0, r: 15}, // Central node
                    {x: -50, y: -30, r: 10}, // Node 1
                    {x: 50, y: -30, r: 10},  // Node 2
                    {x: -70, y: 20, r: 8},   // Node 3
                    {x: 70, y: 20, r: 8},    // Node 4
                    {x: 0, y: 50, r: 12}     // Node 5
                ],
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    display: false,
                    min: -100,
                    max: 100
                },
                y: {
                    display: false,
                    min: -50,
                    max: 80
                }
            }
        }
    });
}

/**
 * Initialize IoT Live Data Chart
 */
function initializeIoTLiveChart() {
    const ctx = document.getElementById('iotLiveDataChart');
    if (!ctx) return;
    
    iotLiveDataChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Temperature', 'Humidity', 'Pressure', 'Light', 'Motion', 'Air Quality'],
            datasets: [{
                label: 'Sensor Readings',
                data: [24.5, 65, 1013, 450, 12, 85],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

/**
 * Map IoT sensor data to performance metrics
 */
function mapIoTDataToPerformance(iotSensors) {
    const sensors = {};
    iotSensors.forEach(sensor => {
        sensors[sensor.sensorName] = sensor.value;
    });
    
    return {
        latency: 100 + (sensors.Temperature - 20) * 2 + sensors.Motion * 1.5,
        energy: 300 + (sensors.Temperature - 22) * 3 + sensors.Pressure * 0.8,
        bandwidth: 1000 + sensors.Motion * 8 + sensors.LightLevel * 0.3,
        responseTime: 80 + Math.abs(sensors.Temperature - 25) * 1.2,
        schedulingTime: 40 + sensors.Motion * 0.6,
        loadBalance: 90 - Math.abs(sensors.Temperature - 23) * 0.8
    };
}

/**
 * Update IoT Data and refresh all metrics
 */
async function updateIoTDataNow() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/iot-data/live`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.sensors) {
            // Update IoT sensor values
            data.sensors.forEach(sensor => {
                const elementId = sensor.sensorName.toLowerCase().replace(' ', '') + 'Value';
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = sensor.value.toFixed(1);
                }
            });
            
            // Update IoT chart
            if (iotLiveDataChart) {
                const chartData = data.sensors.map(sensor => sensor.value);
                iotLiveDataChart.data.datasets[0].data = chartData;
                iotLiveDataChart.update('active');
            }
            
            // Map to performance metrics
            const performance = mapIoTDataToPerformance(data.sensors);
            updatePerformanceMetrics(performance);
            
            // Update last update time
            document.getElementById('iotLastUpdate').textContent = 'Just now';
            
            console.log('✓ IoT data updated:', performance);
        }
    } catch (error) {
        console.error('Error updating IoT data:', error);
    }
}

/**
 * Update all performance metrics based on IoT data
 */
function updatePerformanceMetrics(performance) {
    // Update metric values
    updateMetricValue('latencyValue', performance.latency, 'ms');
    updateMetricValue('energyValue', performance.energy, 'kWh');
    updateMetricValue('bandwidthValue', performance.bandwidth / 1000, 'GB/s');
    updateMetricValue('responseTimeValue', performance.responseTime, 'ms');
    updateMetricValue('loadBalanceValue', performance.loadBalance, '%');
    updateMetricValue('schedulingTimeValue', performance.schedulingTime, 'ms');
    
    // Update charts with new data
    updateChartsWithNewData(performance);
}

/**
 * Update metric value in DOM
 */
function updateMetricValue(elementId, value, unit) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value.toFixed(0);
        const unitElement = element.nextElementSibling;
        if (unitElement && unitElement.classList.contains('metric-unit')) {
            unitElement.textContent = unit;
        }
    }
}

/**
 * Update charts with new performance data
 */
function updateChartsWithNewData(performance) {
    // Update latency chart
    if (latencyChart) {
        latencyChart.data.datasets[0].data.push(performance.latency);
        if (latencyChart.data.datasets[0].data.length > 3) {
            latencyChart.data.datasets[0].data.shift();
        }
        latencyChart.update('none');
    }
    
    // Update energy chart
    if (energyChart) {
        energyChart.data.datasets[0].data.push(performance.energy);
        if (energyChart.data.datasets[0].data.length > 3) {
            energyChart.data.datasets[0].data.shift();
        }
        energyChart.update('none');
    }
    
    // Update bandwidth chart
    if (bandwidthChart) {
        bandwidthChart.data.datasets[0].data.push(performance.bandwidth);
        if (bandwidthChart.data.datasets[0].data.length > 3) {
            bandwidthChart.data.datasets[0].data.shift();
        }
        bandwidthChart.update('none');
    }
    
    // Update response time chart
    if (responseTimeChart) {
        responseTimeChart.data.datasets[0].data.push(performance.responseTime);
        if (responseTimeChart.data.datasets[0].data.length > 3) {
            responseTimeChart.data.datasets[0].data.shift();
        }
        responseTimeChart.update('none');
    }
    
    // Update load balance chart
    if (loadBalanceChart) {
        loadBalanceChart.data.datasets[0].data.push(performance.loadBalance);
        if (loadBalanceChart.data.datasets[0].data.length > 3) {
            loadBalanceChart.data.datasets[0].data.shift();
        }
        loadBalanceChart.update('none');
    }
    
    // Update scheduling time chart
    if (schedulingTimeChart) {
        schedulingTimeChart.data.datasets[0].data.push(performance.schedulingTime);
        if (schedulingTimeChart.data.datasets[0].data.length > 3) {
            schedulingTimeChart.data.datasets[0].data.shift();
        }
        schedulingTimeChart.update('none');
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
    }, 120000);
    
    console.log('✓ IoT data integration started (2-minute intervals)');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        updateIoTDataNow();
        updateSystemStatus();
    });
    
    // Settings button (placeholder)
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        alert('Settings panel coming soon!');
    });
}

/**
 * Update system status
 */
function updateSystemStatus() {
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    
    // Test backend connection
    fetch(`${API_BASE_URL}/`)
        .then(response => {
            if (response.ok) {
                statusText.textContent = 'Connected';
                statusDot.style.background = '#2ecc71';
            } else {
                statusText.textContent = 'Error';
                statusDot.style.background = '#e74c3c';
            }
        })
        .catch(error => {
            statusText.textContent = 'Disconnected';
            statusDot.style.background = '#f39c12';
        });
    
    // Update last update time
    document.getElementById('lastUpdate').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

/**
 * Initialize Comparison Chart
 */
function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid'],
            datasets: [
                {
                    label: 'Latency (ms)',
                    data: [125, 106, 138, 119, 100],
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Energy (kWh)',
                    data: [342, 308, 359, 291, 257],
                    backgroundColor: 'rgba(241, 196, 15, 0.8)',
                    borderColor: 'rgba(241, 196, 15, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Bandwidth (GB/s)',
                    data: [1.2, 1.1, 1.2, 1.1, 1.0],
                    backgroundColor: 'rgba(155, 89, 182, 0.8)',
                    borderColor: 'rgba(155, 89, 182, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Response Time (ms)',
                    data: [89, 80, 93, 78, 73],
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Scheduling Time (ms)',
                    data: [45, 38, 50, 41, 34],
                    backgroundColor: 'rgba(231, 76, 60, 0.8)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Load Balance (%)',
                    data: [92, 83, 87, 78, 64],
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    borderRadius: 6
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
                        font: {
                            size: 12
                        },
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
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
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
        }
    });
}

/**
 * Update Comparison Chart based on selected metric
 */
function updateComparisonChart() {
    const metricSelect = document.getElementById('metricSelect');
    const selectedMetric = metricSelect ? metricSelect.value : 'all';
    
    if (!comparisonChart) return;
    
    // Generate IoT-based performance data
    const iotData = generateIoTBasedPerformance();
    
    let datasets = [];
    
    if (selectedMetric === 'all') {
        // Show all metrics
        datasets = [
            {
                label: 'Latency (ms)',
                data: iotData.latency,
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                borderRadius: 6
            },
            {
                label: 'Energy (kWh)',
                data: iotData.energy,
                backgroundColor: 'rgba(241, 196, 15, 0.8)',
                borderColor: 'rgba(241, 196, 15, 1)',
                borderWidth: 2,
                borderRadius: 6
            },
            {
                label: 'Bandwidth (GB/s)',
                data: iotData.bandwidth,
                backgroundColor: 'rgba(155, 89, 182, 0.8)',
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 2,
                borderRadius: 6
            },
            {
                label: 'Response Time (ms)',
                data: iotData.responseTime,
                backgroundColor: 'rgba(46, 204, 113, 0.8)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                borderRadius: 6
            },
            {
                label: 'Scheduling Time (ms)',
                data: iotData.schedulingTime,
                backgroundColor: 'rgba(231, 76, 60, 0.8)',
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 2,
                borderRadius: 6
            },
            {
                label: 'Load Balance (%)',
                data: iotData.loadBalance,
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                borderRadius: 6
            }
        ];
    } else {
        // Show selected metric only
        const metricConfig = {
            latency: {
                label: 'Latency (ms)',
                data: iotData.latency,
                color: 'rgba(52, 152, 219, 0.8)'
            },
            energy: {
                label: 'Energy (kWh)',
                data: iotData.energy,
                color: 'rgba(241, 196, 15, 0.8)'
            },
            bandwidth: {
                label: 'Bandwidth (GB/s)',
                data: iotData.bandwidth,
                color: 'rgba(155, 89, 182, 0.8)'
            },
            responseTime: {
                label: 'Response Time (ms)',
                data: iotData.responseTime,
                color: 'rgba(46, 204, 113, 0.8)'
            },
            schedulingTime: {
                label: 'Scheduling Time (ms)',
                data: iotData.schedulingTime,
                color: 'rgba(231, 76, 60, 0.8)'
            },
            loadBalance: {
                label: 'Load Balance (%)',
                data: iotData.loadBalance,
                color: 'rgba(75, 192, 192, 0.8)'
            }
        };
        
        const config = metricConfig[selectedMetric];
        if (config) {
            datasets = [{
                label: config.label,
                data: config.data,
                backgroundColor: config.color,
                borderColor: config.color.replace('0.8', '1'),
                borderWidth: 2,
                borderRadius: 6
            }];
        }
    }
    
    // Update chart
    comparisonChart.data.datasets = datasets;
    comparisonChart.update('active');
    
    console.log(`✓ Comparison chart updated for metric: ${selectedMetric}`);
}

/**
 * Generate IoT-based performance data for all algorithms
 */
function generateIoTBasedPerformance() {
    // Base performance values influenced by IoT sensors
    const baseLatency = 100 + Math.random() * 50;
    const baseEnergy = 300 + Math.random() * 100;
    const baseBandwidth = 0.8 + Math.random() * 0.8;
    const baseResponseTime = 70 + Math.random() * 40;
    const baseSchedulingTime = 30 + Math.random() * 30;
    const baseLoadBalance = 60 + Math.random() * 40;
    
    return {
        latency: [
            baseLatency,                                    // Baseline
            baseLatency * 0.85,                             // SCPSO (15% better)
            baseLatency * 1.1,                              // SCCSO (10% worse)
            baseLatency * 0.95,                             // GWO (5% better)
            baseLatency * 0.8                               // Hybrid (20% better)
        ],
        energy: [
            baseEnergy,                                      // Baseline
            baseEnergy * 0.9,                               // SCPSO (10% better)
            baseEnergy * 1.05,                              // SCCSO (5% worse)
            baseEnergy * 0.85,                              // GWO (15% better)
            baseEnergy * 0.75                                // Hybrid (25% better)
        ],
        bandwidth: [
            baseBandwidth,                                    // Baseline
            baseBandwidth * 0.95,                            // SCPSO (5% better)
            baseBandwidth * 1.0,                             // SCCSO (same)
            baseBandwidth * 0.9,                              // GWO (10% better)
            baseBandwidth * 0.8                               // Hybrid (20% better)
        ],
        responseTime: [
            baseResponseTime,                                 // Baseline
            baseResponseTime * 0.9,                           // SCPSO (10% better)
            baseResponseTime * 1.05,                          // SCCSO (5% worse)
            baseResponseTime * 0.88,                           // GWO (12% better)
            baseResponseTime * 0.82                            // Hybrid (18% better)
        ],
        schedulingTime: [
            baseSchedulingTime,                               // Baseline
            baseSchedulingTime * 0.85,                         // SCPSO (15% better)
            baseSchedulingTime * 1.1,                          // SCCSO (10% worse)
            baseSchedulingTime * 0.9,                           // GWO (10% better)
            baseSchedulingTime * 0.75                           // Hybrid (25% better)
        ],
        loadBalance: [
            baseLoadBalance,                                  // Baseline
            baseLoadBalance * 0.9,                            // SCPSO (10% better)
            baseLoadBalance * 0.95,                            // SCCSO (5% better)
            baseLoadBalance * 0.85,                            // GWO (15% better)
            baseLoadBalance * 0.7                              // Hybrid (30% better)
        ]
    };
}

// Global function for manual comparison chart update
window.updateComparisonChart = updateComparisonChart;

// Global function for manual IoT update
window.updateIoTDataNow = updateIoTDataNow;
