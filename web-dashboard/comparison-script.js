/**
 * Comprehensive Algorithm Comparison Dashboard
 * Multiple visualization types and detailed analysis
 */

// Chart instances
let latencyChart = null;
let energyChart = null;
let bandwidthChart = null;
let responseTimeChart = null;
let schedulingTimeChart = null;
let loadBalanceChart = null;
let radarComparisonChart = null;
let timeSeriesChart = null;
let pieChart = null;

// Algorithm data
const algorithms = ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid'];
const algorithmColors = {
    'Baseline': { bg: 'rgba(52, 152, 219, 0.8)', border: 'rgba(52, 152, 219, 1)' },
    'SCPSO': { bg: 'rgba(46, 204, 113, 0.8)', border: 'rgba(46, 204, 113, 1)' },
    'SCCSO': { bg: 'rgba(241, 196, 15, 0.8)', border: 'rgba(241, 196, 15, 1)' },
    'GWO': { bg: 'rgba(231, 76, 60, 0.8)', border: 'rgba(231, 76, 60, 1)' },
    'Hybrid': { bg: 'rgba(155, 89, 182, 0.8)', border: 'rgba(155, 89, 182, 1)' }
};

// Performance data
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
    populateMetricsTable();
    updateRankings();
    updateStatisticalSummary();
    generateTimeSeriesDataUpdates();
    startIoTDataIntegration();
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
    initializeRadarChart();
    initializeTimeSeriesChart();
    initializePieChart();
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
                borderRadius: 6
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
                borderRadius: 6
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
                borderRadius: 6
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
                borderRadius: 6
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
                borderRadius: 6
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
                borderRadius: 6
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
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
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
                }
            },
            x: {
                grid: {
                    display: false
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
 * Overall Performance Bar Chart
 */
function initializeOverallComparison() {
    const ctx = document.getElementById('overallComparisonChart');
    if (!ctx) return;
    
    overallComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [
                {
                    label: 'Latency (ms)',
                    data: performanceData.latency,
                    backgroundColor: algorithmColors['Baseline'].bg,
                    borderColor: algorithmColors['Baseline'].border,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Energy (kWh)',
                    data: performanceData.energy,
                    backgroundColor: algorithmColors['SCPSO'].bg,
                    borderColor: algorithmColors['SCPSO'].border,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Response Time (ms)',
                    data: performanceData.responseTime,
                    backgroundColor: algorithmColors['GWO'].bg,
                    borderColor: algorithmColors['GWO'].border,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Load Balance (%)',
                    data: performanceData.loadBalance,
                    backgroundColor: algorithmColors['Hybrid'].bg,
                    borderColor: algorithmColors['Hybrid'].border,
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
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Radar Chart for Multi-Metric Analysis
 */
function initializeRadarChart() {
    const ctx = document.getElementById('radarComparisonChart');
    if (!ctx) return;
    
    // Normalize data for radar chart (lower is better for most metrics)
    const normalizedData = algorithms.map((algo, index) => ({
        label: algo,
        data: [
            (100 - performanceData.latency[index]) / 100 * 100,
            (100 - performanceData.energy[index]) / 100 * 100,
            (100 - performanceData.bandwidth[index]) / 1.2 * 100,
            (100 - performanceData.responseTime[index]) / 100 * 100,
            (100 - performanceData.schedulingTime[index]) / 50 * 100,
            performanceData.loadBalance[index] / 100 * 100
        ],
        backgroundColor: algorithmColors[algo].bg,
        borderColor: algorithmColors[algo].border,
        borderWidth: 2,
        pointBackgroundColor: algorithmColors[algo].border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: algorithmColors[algo].border
    }));
    
    radarComparisonChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Latency', 'Energy', 'Bandwidth', 'Response Time', 'Scheduling', 'Load Balance'],
            datasets: normalizedData
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 11 },
                        padding: 10
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: { size: 10 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 11,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Time Series Chart
 */
function initializeTimeSeriesChart() {
    const ctx = document.getElementById('timeSeriesChart');
    if (!ctx) return;
    
    const timeLabels = ['0min', '5min', '10min', '15min', '20min', '25min', '30min'];
    
    timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: algorithms.map((algo, index) => ({
                label: algo,
                data: generateTimeSeriesData(performanceData.latency[index]),
                borderColor: algorithmColors[algo].border,
                backgroundColor: algorithmColors[algo].bg,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Latency Performance Over Time',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    title: {
                        display: true,
                        text: 'Latency (ms)'
                    }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

/**
 * Pie Chart for Performance Distribution
 */
function initializePieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Calculate average performance scores
    const avgScores = algorithms.map((algo, index) => {
        const latencyScore = (100 - performanceData.latency[index]) / 100 * 100;
        const energyScore = (100 - performanceData.energy[index]) / 100 * 100;
        const responseScore = (100 - performanceData.responseTime[index]) / 100 * 100;
        const loadScore = performanceData.loadBalance[index] / 100 * 100;
        return (latencyScore + energyScore + responseScore + loadScore) / 4 * 100;
    });
    
    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: algorithms,
            datasets: [{
                data: avgScores,
                backgroundColor: algorithms.map(algo => algorithmColors[algo].bg),
                borderColor: algorithms.map(algo => algorithmColors[algo].border),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 11 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generate time series data
 */
function generateTimeSeriesData(baseValue) {
    const data = [];
    for (let i = 0; i < 7; i++) {
        data.push(baseValue + (Math.random() - 0.5) * 20);
    }
    return data;
}

/**
 * Populate detailed metrics table
 */
function populateMetricsTable() {
    const tbody = document.getElementById('metricsTableBody');
    const metrics = [
        { 
            name: 'Latency', 
            unit: 'ms', 
            data: performanceData.latency, 
            lowerIsBetter: true,
            description: 'Average end-to-end delay'
        },
        { 
            name: 'Energy Consumption', 
            unit: 'kWh', 
            data: performanceData.energy, 
            lowerIsBetter: true,
            description: 'Total energy usage'
        },
        { 
            name: 'Bandwidth Usage', 
            unit: 'GB/s', 
            data: performanceData.bandwidth, 
            lowerIsBetter: true,
            description: 'Network bandwidth'
        },
        { 
            name: 'Response Time', 
            unit: 'ms', 
            data: performanceData.responseTime, 
            lowerIsBetter: true,
            description: 'Task completion time'
        },
        { 
            name: 'Scheduling Time', 
            unit: 'ms', 
            data: performanceData.schedulingTime, 
            lowerIsBetter: true,
            description: 'Algorithm overhead'
        },
        { 
            name: 'Load Balance', 
            unit: '%', 
            data: performanceData.loadBalance, 
            lowerIsBetter: false,
            description: 'Load distribution'
        }
    ];
    
    tbody.innerHTML = '';
    
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        const values = metric.data;
        const baseline = values[0];
        
        // Find best performer
        const bestIndex = metric.lowerIsBetter ? 
            values.indexOf(Math.min(...values)) : 
            values.indexOf(Math.max(...values));
        
        // Create metric cell
        const metricCell = document.createElement('td');
        metricCell.innerHTML = `
            <div style="font-weight: 600;">${metric.name}</div>
            <div style="font-size: 0.8em; color: #7f8c8d; margin-top: 2px;">${metric.unit} - ${metric.description}</div>
        `;
        
        // Create algorithm cells
        const algorithmCells = values.map((value, index) => {
            const improvement = ((baseline - value) / baseline * 100).toFixed(1);
            const isBest = index === bestIndex;
            const algorithmClass = algorithms[index].toLowerCase();
            
            let improvementHtml = '';
            if (index > 0) { // Don't show improvement for baseline
                if (improvement > 0) {
                    improvementHtml = `<div class="improvement">+${improvement}%</div>`;
                } else if (improvement < 0) {
                    improvementHtml = `<div class="degradation">${improvement}%</div>`;
                } else {
                    improvementHtml = `<div class="neutral">0%</div>`;
                }
            }
            
            return `
                <td class="${algorithmClass} ${isBest ? 'best-performer' : ''}">
                    <div style="font-weight: 600;">${value.toFixed(2)}</div>
                    ${improvementHtml}
                </td>
            `;
        });
        
        // Create winner cell
        const winnerCell = document.createElement('td');
        winnerCell.className = 'best-performer';
        winnerCell.innerHTML = `
            <div style="font-weight: 700;">🏆 ${algorithms[bestIndex]}</div>
            <div style="font-size: 0.8em; margin-top: 2px;">${values[bestIndex].toFixed(2)} ${metric.unit}</div>
        `;
        
        row.innerHTML = metricCell.outerHTML + algorithmCells.join('') + winnerCell.outerHTML;
        tbody.appendChild(row);
    });
}

/**
 * Update algorithm rankings
 */
function updateRankings() {
    const rankingList = document.getElementById('rankingList');
    
    // Calculate overall scores
    const scores = algorithms.map((algo, index) => {
        const latencyScore = performanceData.latency[index];
        const energyScore = performanceData.energy[index];
        const responseScore = performanceData.responseTime[index];
        const schedulingScore = performanceData.schedulingTime[index];
        const loadScore = performanceData.loadBalance[index];
        
        // Normalize and combine scores (lower is better for most)
        const totalScore = latencyScore + energyScore + responseScore + schedulingScore + (100 - loadScore);
        
        return { name: algo, score: totalScore, color: algorithmColors[algo].border };
    });
    
    // Sort by score (lower is better)
    scores.sort((a, b) => a.score - b.score);
    
    rankingList.innerHTML = '';
    scores.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'ranking-item';
        li.innerHTML = `
            <div class="rank-number">${index + 1}</div>
            <div class="rank-info">
                <div class="rank-name" style="color: ${item.color}">${item.name}</div>
                <div class="rank-score">Score: ${item.score.toFixed(1)}</div>
            </div>
        `;
        rankingList.appendChild(li);
    });
}

/**
 * Update statistical summary
 */
function updateStatisticalSummary() {
    const summaryStats = document.getElementById('summaryStats');
    
    // Calculate statistics
    const allValues = Object.values(performanceData).flat();
    const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const variance = allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    const stats = [
        { label: 'Mean', value: mean.toFixed(2) },
        { label: 'Std Dev', value: stdDev.toFixed(2) },
        { label: 'Min', value: min.toFixed(2) },
        { label: 'Max', value: max.toFixed(2) },
        { label: 'Range', value: (max - min).toFixed(2) },
        { label: 'Algorithms', value: algorithms.length }
    ];
    
    summaryStats.innerHTML = '';
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'summary-stat';
        div.innerHTML = `
            <div class="summary-value">${stat.value}</div>
            <div class="summary-label">${stat.label}</div>
        `;
        summaryStats.appendChild(div);
    });
}

/**
 * Generate time series data with real-time updates
 */
function generateTimeSeriesDataUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        if (timeSeriesChart) {
            timeSeriesChart.data.datasets.forEach(dataset => {
                const lastValue = dataset.data[dataset.data.length - 1];
                const newValue = lastValue + (Math.random() - 0.5) * 10;
                dataset.data.push(newValue);
                if (dataset.data.length > 7) {
                    dataset.data.shift();
                }
            });
            timeSeriesChart.update('none');
        }
    }, 3000); // Update every 3 seconds
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
        ]
    };
}

/**
 * Update IoT Data and refresh all charts and table
 */
async function refreshAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/iot-data/live`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.success && data.sensors) {
            // Map IoT data to performance metrics
            const newPerformanceData = mapIoTDataToPerformance(data.sensors);
            
            // Update performance data
            performanceData = newPerformanceData;
            
            // Refresh all individual charts
            updateChartData(latencyChart, performanceData.latency);
            updateChartData(energyChart, performanceData.energy);
            updateChartData(bandwidthChart, performanceData.bandwidth);
            updateChartData(responseTimeChart, performanceData.responseTime);
            updateChartData(schedulingTimeChart, performanceData.schedulingTime);
            updateChartData(loadBalanceChart, performanceData.loadBalance);
            
            // Refresh table and other components
            populateMetricsTable();
            updateRankings();
            updateStatisticalSummary();
            
            console.log('✓ All data refreshed with IoT data');
            console.log('🌐 IoT Sensors:', data.sensors);
            console.log('📊 New Performance:', newPerformanceData);
        }
    } catch (error) {
        console.error('Error updating IoT data:', error);
        // Use random data if IoT fails
        randomizeData();
    }
}

/**
 * Start IoT data integration
 */
function startIoTDataIntegration() {
    // Update immediately
    refreshAllData();
    
    // Then update every 2 minutes
    iotAutoUpdateInterval = setInterval(() => {
        if (isIoTAutoUpdateEnabled) {
            refreshAllData();
        }
    }, 120000); // 2 minutes
    
    console.log('✓ IoT data integration started for comparison dashboard');
}

/**
 * Export report
 */
function exportReport() {
    const report = {
        timestamp: new Date().toISOString(),
        algorithms: algorithms,
        metrics: performanceData,
        rankings: calculateRankings(),
        statistics: calculateStatistics()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `algorithm-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✓ Report exported');
}

/**
 * Calculate rankings
 */
function calculateRankings() {
    return algorithms.map((algo, index) => ({
        algorithm: algo,
        latency: performanceData.latency[index],
        energy: performanceData.energy[index],
        bandwidth: performanceData.bandwidth[index],
        responseTime: performanceData.responseTime[index],
        schedulingTime: performanceData.schedulingTime[index],
        loadBalance: performanceData.loadBalance[index]
    }));
}

/**
 * Calculate statistics
 */
function calculateStatistics() {
    const allValues = Object.values(performanceData).flat();
    const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const variance = allValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allValues.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        mean: mean,
        standardDeviation: stdDev,
        min: Math.min(...allValues),
        max: Math.max(...allValues),
        count: allValues.length
    };
}

/**
 * Toggle animation
 */
let animationEnabled = true;
function toggleAnimation() {
    animationEnabled = !animationEnabled;
    const charts = [overallComparisonChart, radarComparisonChart, timeSeriesChart, pieChart];
    
    charts.forEach(chart => {
        if (chart) {
            chart.options.animation.duration = animationEnabled ? 1500 : 0;
            chart.update();
        }
    });
    
    console.log(`Animation ${animationEnabled ? 'enabled' : 'disabled'}`);
}

// Global functions
window.refreshAllData = refreshAllData;
window.exportReport = exportReport;
window.toggleAnimation = toggleAnimation;
