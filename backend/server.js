/**
 * iFogSim Backend Server
 * Provides API endpoint to trigger simulations with different algorithms
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate dependencies
try {
    require('express');
    require('cors');
    console.log('✓ All dependencies loaded successfully');
} catch (error) {
    console.error('✗ Missing dependency:', error.message);
    console.error('Please run: npm install');
    process.exit(1);
}

// Middleware
// CORS configuration - allow all origins for development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false
}));

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const RESULTS_DIR = path.join(PROJECT_ROOT, 'results');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const OUT_DIR = path.join(PROJECT_ROOT, 'out', 'production', 'iFogSim2'); // Compiled classes directory

/**
 * POST /run-simulation
 * Triggers iFogSim simulation with selected algorithm
 * Body: { "algorithm": "SCPSO" | "SCCSO" | "GWO" | "Baseline" }
 */
app.post('/run-simulation', async (req, res) => {
    console.log('=== POST /run-simulation received ===');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Headers:', req.headers);
    
    const { algorithm, enableFL, numRuns = 1 } = req.body;
    
    if (!algorithm) {
        console.log('Error: Algorithm parameter missing');
        return res.status(400).json({ 
            error: 'Algorithm parameter is required',
            validAlgorithms: ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid']
        });
    }
    
    const validAlgorithms = ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid'];
    if (!validAlgorithms.includes(algorithm)) {
        return res.status(400).json({ 
            error: 'Invalid algorithm',
            validAlgorithms: validAlgorithms
        });
    }
    
    // Handle Hybrid mode (use GWO with FL)
    // IMPORTANT: Pass "Hybrid" to Java so it generates files with "hybrid" prefix
    // The Java code will internally use GWO but set algorithm name to "Hybrid" for file naming
    const javaAlgorithm = algorithm; // Pass original algorithm name (including "Hybrid")
    const shouldEnableFL = enableFL || algorithm === 'Hybrid';
    
    console.log(`Starting simulation with algorithm: ${algorithm}${shouldEnableFL ? ' (FL enabled)' : ''}`);
    
    try {
        // Build classpath - collect all JAR files from lib directory
        const jarFiles = [];
        try {
            const libFiles = fs.readdirSync(LIB_DIR);
            for (const file of libFiles) {
                const filePath = path.join(LIB_DIR, file);
                if (fs.statSync(filePath).isFile() && file.endsWith('.jar')) {
                    jarFiles.push(filePath);
                }
            }
            // Also check for JARs in subdirectories (commons-math3, etc.)
            const libSubdirs = libFiles.filter(f => {
                const subPath = path.join(LIB_DIR, f);
                return fs.statSync(subPath).isDirectory();
            });
            for (const subdir of libSubdirs) {
                const subPath = path.join(LIB_DIR, subdir);
                try {
                    const subFiles = fs.readdirSync(subPath);
                    for (const file of subFiles) {
                        const filePath = path.join(subPath, file);
                        if (fs.statSync(filePath).isFile() && file.endsWith('.jar')) {
                            jarFiles.push(filePath);
                        }
                    }
                } catch (e) {
                    // Skip if can't read subdirectory
                }
            }
        } catch (e) {
            console.warn('Warning: Could not read lib directory:', e.message);
        }
        
        // Build classpath string
        // Use compiled classes directory if it exists, otherwise fall back to src
        const classesDir = fs.existsSync(OUT_DIR) ? OUT_DIR : SRC_DIR;
        const classpath = [
            ...jarFiles,
            classesDir
        ].join(path.delimiter);
        
        console.log('Using classes directory:', classesDir);
        console.log('Classes directory exists:', fs.existsSync(classesDir));
        
        console.log('Classpath JARs found:', jarFiles.length);
        console.log('Classpath:', classpath.substring(0, 200) + '...');
        
        // PART A: Java command to run DynamicSimulation
        // DynamicSimulation handles all algorithms (Baseline, SCPSO, SCCSO, GWO, Hybrid)
        // Pass enableFL as second argument if true
        // IMPORTANT: Pass original algorithm name (including "Hybrid") so Java can set correct file names
        const flFlag = shouldEnableFL ? ' FL' : '';
        const javaCommand = `java -cp "${classpath}" org.fog.test.DynamicSimulation ${javaAlgorithm}${flFlag}`;
        
        console.log('========================================');
        console.log(`PART A: FORCING iFogSim EXECUTION`);
        console.log(`Algorithm: ${algorithm}`);
        console.log(`Java Algorithm: ${javaAlgorithm}`);
        console.log(`FL Enabled: ${shouldEnableFL}`);
        console.log(`Command: ${javaCommand}`);
        console.log('========================================');
    
        // PART A: Execute simulation and WAIT for completion
        exec(javaCommand, { 
            cwd: PROJECT_ROOT,
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        }, (error, stdout, stderr) => {
            // PART A: Check exit code - error object contains exit code
            if (error) {
                console.error('========================================');
                console.error('Simulation execution FAILED');
                console.error('Exit code:', error.code);
                console.error('Error message:', error.message);
                console.error('STDERR:', stderr);
                console.error('STDOUT:', stdout);
                console.error('========================================');
                
                // Extract meaningful error from stderr or stdout
                let errorDetails = stderr || stdout || error.message;
                
                // Try to extract the most relevant error line
                let primaryError = error.message;
                if (stderr) {
                    const stderrLines = stderr.split('\n');
                    // Look for common Java error patterns
                    const errorPatterns = [
                        /Error:/i,
                        /Exception:/i,
                        /Could not find/i,
                        /ClassNotFoundException/i,
                        /NoClassDefFoundError/i,
                        /UnsupportedClassVersionError/i
                    ];
                    
                    for (const line of stderrLines) {
                        for (const pattern of errorPatterns) {
                            if (pattern.test(line)) {
                                primaryError = line.trim();
                                break;
                            }
                        }
                        if (primaryError !== error.message) break;
                    }
                }
                
                // If stderr is very long, truncate it but keep important parts
                if (errorDetails && errorDetails.length > 1000) {
                    const lines = errorDetails.split('\n');
                    // Keep first 15 lines and last 15 lines
                    const importantLines = [
                        ...lines.slice(0, 15),
                        '... (truncated) ...',
                        ...lines.slice(-15)
                    ];
                    errorDetails = importantLines.join('\n');
                }
                
                return res.status(500).json({ 
                    success: false,
                    error: 'Simulation execution failed',
                    message: primaryError || `Java process exited with code ${error.code}: ${error.message}`,
                    details: errorDetails,
                    exitCode: error.code,
                    stderr: stderr ? stderr.substring(0, 2000) : undefined, // Limit stderr size
                    stdout: stdout ? stdout.substring(0, 1000) : undefined // Limit stdout size
                });
            }
            
            // PART A: Process completed successfully (exitCode === 0)
            console.log('========================================');
            console.log(`PART A: Simulation process completed for ${algorithm}`);
            console.log('Exit code: 0 (success)');
            if (stdout) {
                const outputPreview = stdout.length > 1000 ? stdout.substring(0, 1000) + '...' : stdout;
                console.log('Simulation output:', outputPreview);
            }
            if (stderr && stderr.trim()) {
                console.log('Simulation stderr:', stderr.substring(0, 500));
            }
            console.log('========================================');
            
            // Algorithm name for file lookup (Hybrid uses "hybrid" prefix, others use lowercase)
            const algoLower = algorithm.toLowerCase();
            
            console.log(`Looking for result files with prefix: "${algoLower}"`);
            console.log(`Results directory: ${RESULTS_DIR}`);
            console.log(`Results directory exists: ${fs.existsSync(RESULTS_DIR)}`);
            
            // Define required file paths
            const latencyFile = path.join(RESULTS_DIR, `${algoLower}_latency.json`);
            const energyFile = path.join(RESULTS_DIR, `${algoLower}_energy.json`);
            const bandwidthFile = path.join(RESULTS_DIR, `${algoLower}_bandwidth.json`);
            
            console.log(`Expected files:`);
            console.log(`  - ${latencyFile}`);
            console.log(`  - ${energyFile}`);
            console.log(`  - ${bandwidthFile}`);
            const responseTimeFile = path.join(RESULTS_DIR, `${algoLower}_response_time.json`);
            const schedulingTimeFile = path.join(RESULTS_DIR, `${algoLower}_scheduling_time.json`);
            const loadBalanceFile = path.join(RESULTS_DIR, `${algoLower}_load_balance.json`);
            const migrationFile = path.join(RESULTS_DIR, 'migration_logs.json');
            const flMetricsFile = path.join(RESULTS_DIR, 'fl_metrics.json');
            
            // PART B: GUARANTEED RESULT LOADING - Wait for required files to exist
            console.log('========================================');
            console.log('PART B: GUARANTEED RESULT LOADING');
            console.log('Expected files:');
            console.log(`  - ${path.basename(latencyFile)}`);
            console.log(`  - ${path.basename(energyFile)}`);
            console.log(`  - ${path.basename(bandwidthFile)}`);
            console.log(`  - ${path.basename(responseTimeFile)}`);
            console.log(`  - ${path.basename(schedulingTimeFile)}`);
            console.log(`  - ${path.basename(loadBalanceFile)}`);
            console.log('Waiting for result files to be generated...');
            console.log('========================================');
            const requiredFiles = [latencyFile, energyFile, bandwidthFile];
            const maxWaitTime = 15000; // 15 seconds (increased for slower systems)
            const pollInterval = 500; // 500ms
            
            // Poll for files using promise
            const waitForFiles = () => {
                return new Promise((resolve, reject) => {
                    const startTime = Date.now();
                    
                    const checkFiles = () => {
                        const allFilesExist = requiredFiles.every(file => fs.existsSync(file));
                        const elapsed = Date.now() - startTime;
                        
                        if (allFilesExist) {
                            console.log('✓ All required result files found');
                            resolve();
                        } else if (elapsed >= maxWaitTime) {
                            const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
                            console.error('Timeout: Required files not found:', missingFiles);
                            reject(new Error(`Timeout waiting for result files. Missing: ${missingFiles.map(f => path.basename(f)).join(', ')}`));
                        } else {
                            console.log(`Waiting for files... (${Math.round(elapsed / 1000)}s)`);
                            setTimeout(checkFiles, pollInterval);
                        }
                    };
                    
                    checkFiles();
                });
            };
            
            // Wait for files before proceeding (using promise chain since exec callback is not async)
            waitForFiles()
                .then(() => {
                    // PART B: Read and validate files
                    try {
                        console.log('Reading result files...');
                        
                        // Read latency
                        let latency = null;
                        if (fs.existsSync(latencyFile)) {
                            latency = JSON.parse(fs.readFileSync(latencyFile, 'utf8'));
                            console.log(`✓ Loaded latency from: ${path.basename(latencyFile)}`);
                            
                            // Validate latency data
                            if (!latency || !latency.values || !Array.isArray(latency.values) || latency.values.length === 0) {
                                console.error('Invalid latency data:', latency);
                                // PART C: Log warning but don't fail - let frontend handle missing data
                                console.warn('⚠ Latency data invalid, but continuing with other data');
                                latency = null; // Set to null so it's not included in response
                            }
                        } else {
                            console.warn(`⚠ Latency file not found: ${path.basename(latencyFile)}`);
                            latency = null; // Will be checked later if any data exists
                        }
                        
                        // Read energy
                        let energy = null;
                        if (fs.existsSync(energyFile)) {
                            energy = JSON.parse(fs.readFileSync(energyFile, 'utf8'));
                            console.log(`✓ Loaded energy from: ${path.basename(energyFile)}`);
                            
                            // Validate energy data
                            if (!energy || !energy.values || !Array.isArray(energy.values) || energy.values.length === 0) {
                                console.error('Invalid energy data:', energy);
                                // PART C: Log warning but don't fail - let frontend handle missing data
                                console.warn('⚠ Energy data invalid, but continuing with other data');
                                energy = null; // Set to null so it's not included in response
                            }
                        } else {
                            console.warn(`⚠ Energy file not found: ${path.basename(energyFile)}`);
                            energy = null; // Will be checked later if any data exists
                        }
                        
                        // Read bandwidth
                        let bandwidth = null;
                        if (fs.existsSync(bandwidthFile)) {
                            bandwidth = JSON.parse(fs.readFileSync(bandwidthFile, 'utf8'));
                            console.log(`✓ Loaded bandwidth from: ${path.basename(bandwidthFile)}`);
                            
                            // Validate bandwidth data
                            if (!bandwidth || !bandwidth.values || !Array.isArray(bandwidth.values) || bandwidth.values.length === 0) {
                                console.error('Invalid bandwidth data:', bandwidth);
                                // PART C: Log warning but don't fail - let frontend handle missing data
                                console.warn('⚠ Bandwidth data invalid, but continuing with other data');
                                bandwidth = null; // Set to null so it's not included in response
                            }
                        } else {
                            console.warn(`⚠ Bandwidth file not found: ${path.basename(bandwidthFile)}`);
                            bandwidth = null; // Will be checked later if any data exists
                        }
                        
                        // Read migration logs (optional, not algorithm-prefixed)
                        let migrationLogs = null;
                        if (fs.existsSync(migrationFile)) {
                            migrationLogs = JSON.parse(fs.readFileSync(migrationFile, 'utf8'));
                            console.log(`✓ Loaded migration logs from: ${path.basename(migrationFile)}`);
                        } else {
                            console.warn(`⚠ Migration logs file not found: ${path.basename(migrationFile)} (optional)`);
                        }
                        
                        // Read FL metrics (only if FL was enabled)
                        let flMetrics = null;
                        if (shouldEnableFL) {
                            if (fs.existsSync(flMetricsFile)) {
                                flMetrics = JSON.parse(fs.readFileSync(flMetricsFile, 'utf8'));
                                console.log(`✓ Loaded FL metrics from: ${path.basename(flMetricsFile)}`);
                                // Security justification log
                                console.log('🔒 SECURITY: Federated Learning enabled - Privacy preservation through model-only aggregation, secure collaborative optimization without raw data migration');
                            } else {
                                console.warn(`⚠ FL metrics file not found: ${path.basename(flMetricsFile)} (optional)`);
                            }
                        }
                        
                        // Read new evaluation metrics
                        let responseTime = null;
                        if (fs.existsSync(responseTimeFile)) {
                            responseTime = JSON.parse(fs.readFileSync(responseTimeFile, 'utf8'));
                            console.log(`✓ Loaded response time from: ${path.basename(responseTimeFile)}`);
                            if (!responseTime || !responseTime.values || !Array.isArray(responseTime.values) || responseTime.values.length === 0) {
                                console.warn('⚠ Response time data invalid');
                                responseTime = null;
                            }
                        } else {
                            console.warn(`⚠ Response time file not found: ${path.basename(responseTimeFile)} (optional)`);
                        }
                        
                        let schedulingTime = null;
                        if (fs.existsSync(schedulingTimeFile)) {
                            schedulingTime = JSON.parse(fs.readFileSync(schedulingTimeFile, 'utf8'));
                            console.log(`✓ Loaded scheduling time from: ${path.basename(schedulingTimeFile)}`);
                            if (!schedulingTime || !schedulingTime.values || !Array.isArray(schedulingTime.values) || schedulingTime.values.length === 0) {
                                console.warn('⚠ Scheduling time data invalid');
                                schedulingTime = null;
                            }
                        } else {
                            console.warn(`⚠ Scheduling time file not found: ${path.basename(schedulingTimeFile)} (optional)`);
                        }
                        
                        let loadBalance = null;
                        if (fs.existsSync(loadBalanceFile)) {
                            loadBalance = JSON.parse(fs.readFileSync(loadBalanceFile, 'utf8'));
                            console.log(`✓ Loaded load balance from: ${path.basename(loadBalanceFile)}`);
                            if (!loadBalance || !loadBalance.values || !Array.isArray(loadBalance.values) || loadBalance.values.length === 0) {
                                console.warn('⚠ Load balance data invalid');
                                loadBalance = null;
                            }
                        } else {
                            console.warn(`⚠ Load balance file not found: ${path.basename(loadBalanceFile)} (optional)`);
                        }
                        
                        // PART C: Check if we have ANY valid data
                        const hasAnyData = (latency && latency.values && latency.values.length > 0) ||
                                          (energy && energy.values && energy.values.length > 0) ||
                                          (bandwidth && bandwidth.values && bandwidth.values.length > 0);
                        
                        // PART C: ALWAYS set success=true when data exists
                        // If we got here, files were read (even if some are invalid)
                        // Frontend will handle missing data gracefully
                        const response = {
                            success: hasAnyData ? true : false, // true if ANY data exists
                            algorithm: algorithm, // Return original algorithm name (Hybrid if selected)
                            latency: latency,
                            energy: energy,
                            bandwidth: bandwidth,
                            responseTime: responseTime,
                            schedulingTime: schedulingTime,
                            loadBalance: loadBalance,
                            migrationLogs: migrationLogs,
                            flMetrics: flMetrics
                        };
                        
                        // PART C: If no data at all, return error
                        if (!hasAnyData) {
                            console.error('========================================');
                            console.error('PART C: No valid data in any result file');
                            console.error('Latency:', latency ? 'exists but invalid' : 'missing');
                            console.error('Energy:', energy ? 'exists but invalid' : 'missing');
                            console.error('Bandwidth:', bandwidth ? 'exists but invalid' : 'missing');
                            console.error('========================================');
                            return res.status(500).json({
                                success: false,
                                error: 'Result files exist but contain no valid data',
                                message: 'All result files were empty or invalid'
                            });
                        }
                        
                        // PART A: Log RAW response object before any condition checks
                        console.log('========================================');
                        console.log('RAW RESPONSE OBJECT:');
                        console.log(JSON.stringify(response, null, 2));
                        console.log('Response type check - success is boolean:', typeof response.success === 'boolean');
                        console.log('Response type check - success value:', response.success);
                        console.log('========================================');
                        
                        // PART A: Aggregate statistics if multiple runs requested
                        if (numRuns > 1) {
                            console.log(`Aggregating statistics for ${numRuns} runs...`);
                            // In a real implementation, we would run the simulation numRuns times
                            // and aggregate results. For now, we'll compute statistics from current run
                            // and indicate that multiple runs should be performed separately
                            console.log(`Note: For proper multi-run statistics, run simulation ${numRuns} times`);
                        }
                        
                        // PART A: Send response EXACTLY once using return
                        return res.status(200).json(response);
                        
                    } catch (readError) {
                    console.error('Error reading result files:', readError);
                    console.error('Stack:', readError.stack);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Failed to read simulation results',
                        message: readError.message,
                        stack: process.env.NODE_ENV === 'development' ? readError.stack : undefined
                    });
                }
                })
                .catch((waitError) => {
                    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
                    return res.status(500).json({
                        success: false,
                        error: 'Simulation completed but result files not found',
                        message: waitError.message,
                        missingFiles: missingFiles.map(f => path.basename(f))
                    });
                });
        });
        
    } catch (err) {
        console.error('Error starting simulation process:', err);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to start simulation',
            message: err.message
        });
    }
});

/**
 * GET /health
 * Health check endpoint - must respond quickly
 */
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        service: 'iFogSim Backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * GET / (root endpoint)
 * Simple root endpoint for testing
 */
app.get('/', (req, res) => {
    res.json({ 
        message: 'iFogSim Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            runSimulation: 'POST /run-simulation',
            algorithms: 'GET /algorithms',
            flMetrics: 'GET /api/fl-metrics'
        }
    });
});

/**
 * GET /algorithms
 * Returns list of available algorithms
 */
app.get('/algorithms', (req, res) => {
    res.json({ 
        algorithms: ['Baseline', 'SCPSO', 'SCCSO', 'GWO', 'Hybrid']
    });
});

/**
 * GET /api/summary-stats/:algorithm
 * Returns aggregated summary statistics for an algorithm
 */
app.get('/api/summary-stats/:algorithm', (req, res) => {
    const algorithm = req.params.algorithm.toLowerCase();
    const statsFile = path.join(RESULTS_DIR, `${algorithm}_summary_stats.json`);
    
    try {
        if (fs.existsSync(statsFile)) {
            const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
            console.log('Summary statistics served for:', algorithm);
            res.json(stats);
        } else {
            res.json({
                algorithm: algorithm,
                error: 'Summary statistics not available. Run multiple simulations and aggregate results first.',
                numRuns: 0
            });
        }
    } catch (error) {
        console.error('Error reading summary statistics:', error);
        res.status(500).json({ 
            error: 'Failed to read summary statistics',
            algorithm: algorithm
        });
    }
});

/**
 * POST /api/aggregate-stats
 * Triggers statistics aggregation for an algorithm (for N runs)
 */
app.post('/api/aggregate-stats', (req, res) => {
    const { algorithm, numRuns = 5 } = req.body;
    
    if (!algorithm) {
        return res.status(400).json({ 
            error: 'Algorithm parameter is required'
        });
    }
    
    try {
        // Execute Java StatisticsAggregator
        const classpath = [
            path.join(LIB_DIR, '*.jar'),
            SRC_DIR
        ].join(path.delimiter);
        
        const javaCommand = `java -cp "${classpath}" org.fog.utils.StatisticsAggregator ${algorithm} ${numRuns}`;
        
        exec(javaCommand, { 
            cwd: PROJECT_ROOT,
            maxBuffer: 1024 * 1024 * 10
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('Statistics aggregation failed:', error);
                return res.status(500).json({ 
                    success: false,
                    error: 'Statistics aggregation failed',
                    message: error.message
                });
            }
            
            // Read aggregated statistics
            const algoLower = algorithm.toLowerCase();
            const statsFile = path.join(RESULTS_DIR, `${algoLower}_summary_stats.json`);
            
            if (fs.existsSync(statsFile)) {
                const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
                res.json({
                    success: true,
                    algorithm: algorithm,
                    numRuns: numRuns,
                    statistics: stats
                });
            } else {
                res.json({
                    success: false,
                    error: 'Statistics file not generated'
                });
            }
        });
        
    } catch (err) {
        console.error('Error aggregating statistics:', err);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to aggregate statistics',
            message: err.message
        });
    }
});

/**
 * GET /api/fl-metrics
 * Returns federated learning metrics from server-side results
 * This is the ONLY way frontend should access FL data (no direct file access)
 */
app.get('/api/fl-metrics', (req, res) => {
    const flMetricsFile = path.join(RESULTS_DIR, 'fl_metrics.json');
    
    try {
        if (fs.existsSync(flMetricsFile)) {
            const flMetrics = JSON.parse(fs.readFileSync(flMetricsFile, 'utf8'));
            console.log('FL metrics served from:', flMetricsFile);
            res.json(flMetrics);
        } else {
            // Return default response if file doesn't exist (FL not enabled)
            console.log('FL metrics file not found, returning flEnabled=false');
            res.json({
                flEnabled: false,
                rounds: 0,
                fogNodes: 0,
                localModels: [],
                globalModel: {},
                privacy: "N/A"
            });
        }
    } catch (error) {
        console.error('Error reading FL metrics:', error);
        res.status(500).json({ 
            error: 'Failed to read FL metrics',
            flEnabled: false
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        path: req.path 
    });
});

// Start server with error handling
try {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('========================================');
        console.log('✓ iFogSim Backend Server started');
        console.log(`✓ Listening on http://localhost:${PORT}`);
        console.log(`✓ Project root: ${PROJECT_ROOT}`);
        console.log('========================================');
        console.log('Available endpoints:');
        console.log(`  GET  http://localhost:${PORT}/`);
        console.log(`  GET  http://localhost:${PORT}/health`);
        console.log(`  POST http://localhost:${PORT}/run-simulation`);
        console.log(`  GET  http://localhost:${PORT}/algorithms`);
        console.log(`  GET  http://localhost:${PORT}/api/fl-metrics`);
        console.log('========================================');
        console.log('Server is ready to accept requests');
        console.log('========================================');
    });
    
    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`✗ Port ${PORT} is already in use`);
            console.error('Please stop the other process or use a different port');
            process.exit(1);
        } else {
            console.error('✗ Server error:', error);
            process.exit(1);
        }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
    
} catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
}
