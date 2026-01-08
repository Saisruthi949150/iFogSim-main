/**
 * Fog Computing Optimization Dashboard - JavaScript
 * Part 3: Web Dashboard Visualization
 * 
 * This script handles:
 * - Loading and displaying performance metrics for SCPSO, SCCSO, and GWO algorithms
 * - Creating interactive bar charts using Chart.js
 * - Populating the summary comparison table
 * 
 * Note: Sample data is hardcoded here. In a production environment,
 * this data would be loaded from results.csv or an API endpoint.
 */

// Sample performance data for SCPSO, SCCSO, and GWO algorithms
// These values are representative sample data derived from typical
// optimization algorithm performance in fog computing simulations.
// 
// Data structure matches the metrics from results.csv:
// - Execution Time: Total time to complete all tasks (milliseconds)
// - Delay: Average latency in task processing (milliseconds)
// - Energy: Total energy consumed by fog devices (Joules)
// - Network Usage: Total data transferred over network (Bytes)
const performanceData = {
    scpso: {
        executionTime: 125.5,
        delay: 45.2,
        energy: 185.3,
        networkUsage: 1024.5
    },
    sccso: {
        executionTime: 138.7,
        delay: 52.1,
        energy: 198.6,
        networkUsage: 1156.8
    },
    gwo: {
        executionTime: 142.3,
        delay: 48.9,
        energy: 192.4,
        networkUsage: 1089.2
    }
};

/**
 * Chart.js Configuration
 * 
 * This configuration object defines the common settings for all bar charts.
 * It ensures consistent styling and behavior across all metric visualizations.
 */
const chartConfig = {
    type: 'bar',
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 15
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 10,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 12
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 11
                    }
                },
                grid: {
                    display: false
                }
            }
        }
    }
};

/**
 * Color Scheme for Algorithms
 * 
 * Each algorithm has a distinct color for easy visual identification:
 * - SCPSO: Blue (professional, trustworthy)
 * - SCCSO: Green (efficient, optimized)
 * - GWO: Yellow/Gold (balanced, stable)
 */
const colors = {
    scpso: {
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2
    },
    sccso: {
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 2
    },
    gwo: {
        backgroundColor: 'rgba(241, 196, 15, 0.8)',
        borderColor: 'rgba(241, 196, 15, 1)',
        borderWidth: 2
    }
};

/**
 * Create Execution Time Chart
 * 
 * Displays a bar chart comparing execution times across all three algorithms.
 * Lower values indicate better performance (faster task completion).
 */
function createExecutionTimeChart() {
    const ctx = document.getElementById('executionTimeChart').getContext('2d');
    new Chart(ctx, {
        ...chartConfig,
        data: {
            labels: ['SCPSO', 'SCCSO', 'GWO'],
            datasets: [{
                label: 'Execution Time (ms)',
                data: [
                    performanceData.scpso.executionTime,
                    performanceData.sccso.executionTime,
                    performanceData.gwo.executionTime
                ],
                backgroundColor: [
                    colors.scpso.backgroundColor,
                    colors.sccso.backgroundColor,
                    colors.gwo.backgroundColor
                ],
                borderColor: [
                    colors.scpso.borderColor,
                    colors.sccso.borderColor,
                    colors.gwo.borderColor
                ],
                borderWidth: 2
            }]
        }
    });
}

/**
 * Create Average Delay Chart
 * 
 * Displays a bar chart comparing average delays across all three algorithms.
 * Lower values indicate better performance (reduced latency).
 */
function createDelayChart() {
    const ctx = document.getElementById('delayChart').getContext('2d');
    new Chart(ctx, {
        ...chartConfig,
        data: {
            labels: ['SCPSO', 'SCCSO', 'GWO'],
            datasets: [{
                label: 'Average Delay (ms)',
                data: [
                    performanceData.scpso.delay,
                    performanceData.sccso.delay,
                    performanceData.gwo.delay
                ],
                backgroundColor: [
                    colors.scpso.backgroundColor,
                    colors.sccso.backgroundColor,
                    colors.gwo.backgroundColor
                ],
                borderColor: [
                    colors.scpso.borderColor,
                    colors.sccso.borderColor,
                    colors.gwo.borderColor
                ],
                borderWidth: 2
            }]
        }
    });
}

/**
 * Create Energy Consumption Chart
 * 
 * Displays a bar chart comparing energy consumption across all three algorithms.
 * Lower values indicate better performance (more energy-efficient).
 */
function createEnergyChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    new Chart(ctx, {
        ...chartConfig,
        data: {
            labels: ['SCPSO', 'SCCSO', 'GWO'],
            datasets: [{
                label: 'Energy Consumption (J)',
                data: [
                    performanceData.scpso.energy,
                    performanceData.sccso.energy,
                    performanceData.gwo.energy
                ],
                backgroundColor: [
                    colors.scpso.backgroundColor,
                    colors.sccso.backgroundColor,
                    colors.gwo.backgroundColor
                ],
                borderColor: [
                    colors.scpso.borderColor,
                    colors.sccso.borderColor,
                    colors.gwo.borderColor
                ],
                borderWidth: 2
            }]
        }
    });
}

/**
 * Create Network Usage Chart
 * 
 * Displays a bar chart comparing network usage across all three algorithms.
 * Lower values indicate better performance (reduced bandwidth consumption).
 */
function createNetworkChart() {
    const ctx = document.getElementById('networkChart').getContext('2d');
    new Chart(ctx, {
        ...chartConfig,
        data: {
            labels: ['SCPSO', 'SCCSO', 'GWO'],
            datasets: [{
                label: 'Network Usage (Bytes)',
                data: [
                    performanceData.scpso.networkUsage,
                    performanceData.sccso.networkUsage,
                    performanceData.gwo.networkUsage
                ],
                backgroundColor: [
                    colors.scpso.backgroundColor,
                    colors.sccso.backgroundColor,
                    colors.gwo.backgroundColor
                ],
                borderColor: [
                    colors.scpso.borderColor,
                    colors.sccso.borderColor,
                    colors.gwo.borderColor
                ],
                borderWidth: 2
            }]
        }
    });
}

/**
 * Populate Summary Table
 * 
 * Creates a comprehensive comparison table showing all metrics for each algorithm.
 * This provides a quick reference for reviewers to compare performance at a glance.
 */
function populateSummaryTable() {
    const tableBody = document.getElementById('summaryTableBody');
    const algorithms = [
        { name: 'SCPSO', data: performanceData.scpso },
        { name: 'SCCSO', data: performanceData.sccso },
        { name: 'GWO', data: performanceData.gwo }
    ];

    algorithms.forEach(alg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${alg.name}</strong></td>
            <td>${alg.data.executionTime.toFixed(2)}</td>
            <td>${alg.data.delay.toFixed(2)}</td>
            <td>${alg.data.energy.toFixed(2)}</td>
            <td>${alg.data.networkUsage.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Initialize Dashboard
 * 
 * This function runs when the page loads (DOMContentLoaded event).
 * It creates all four charts and populates the summary table.
 * 
 * The dashboard is now ready for visualization and comparison.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create all metric charts
    createExecutionTimeChart();
    createDelayChart();
    createEnergyChart();
    createNetworkChart();
    
    // Populate the summary comparison table
    populateSummaryTable();
    
    // Log success message to console (for debugging)
    console.log('Fog Computing Optimization Dashboard loaded successfully!');
    console.log('All charts and tables initialized.');
});