package org.fog.utils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.fog.application.AppLoop;
import org.fog.application.Application;
import org.fog.entities.FogDevice;
import org.fog.utils.FederatedLearningManager.FLStatus;
import org.fog.utils.FederatedLearningManager.LocalModelSummary;
import org.fog.utils.MetricsTracker;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * ResultsExporter
 * 
 * Exports iFogSim simulation results to JSON format for web dashboard consumption.
 * 
 * Exports:
 * - latency.json: Application loop delays
 * - energy.json: Energy consumption per fog device
 * - bandwidth.json: Network usage statistics
 * - migration_logs.json: Data migration logs (placeholder for now)
 */
public class ResultsExporter {
	
	private static String algorithmName = "Baseline";
	private static String resultsDir = "results";
	private static boolean useAlgorithmPrefix = false; // Set to true to create algorithm-specific files
	
	/**
	 * Set the algorithm name for this simulation run
	 * @param algorithm Algorithm name (e.g., "Baseline", "SCPSO", "SCCSO", "GWO")
	 */
	public static void setAlgorithmName(String algorithm) {
		algorithmName = algorithm;
		// Also set algorithm in MigrationLogger for real-time logging
		MigrationLogger.getInstance().setAlgorithm(algorithm);
		// Clear previous migration logs for new simulation
		MigrationLogger.getInstance().clearLogs();
		// Set algorithm in MetricsTracker and clear metrics
		MetricsTracker.getInstance().setAlgorithm(algorithm);
		MetricsTracker.getInstance().clearMetrics();
	}
	
	/**
	 * Enable/disable algorithm-specific file naming
	 * @param enable If true, creates files like "scpso_latency.json", otherwise "latency.json"
	 */
	public static void setUseAlgorithmPrefix(boolean enable) {
		useAlgorithmPrefix = enable;
	}
	
	/**
	 * Set the results directory path
	 * @param directory Results directory path
	 */
	public static void setResultsDirectory(String directory) {
		resultsDir = directory;
	}
	
	/**
	 * Export all simulation results to JSON files
	 * 
	 * @param fogDevices List of fog devices
	 * @param applications Map of applications
	 */
	public static void exportResults(List<FogDevice> fogDevices, Map<String, Application> applications) {
		// Create results directory if it doesn't exist
		File dir = new File(resultsDir);
		if (!dir.exists()) {
			dir.mkdirs();
		}
		
		// Register all fog devices with MigrationLogger for name lookup
		MigrationLogger.getInstance().registerDevices(fogDevices);
		
		// Export latency data
		exportLatency(applications);
		
		// Export energy consumption data
		exportEnergy(fogDevices);
		
		// Export network usage (bandwidth) data
		exportBandwidth();
		
		// Export migration logs (with security info) - now uses real-time data
		exportMigrationLogs(fogDevices);
		
		// Always export federated learning data (will be flEnabled=false if not enabled)
		exportFederatedLearningData();
		
		// Export new evaluation metrics
		exportResponseTime(applications);
		exportSchedulingTime();
		exportLoadBalance(fogDevices);
		
		System.out.println("=========================================");
		System.out.println("Results exported to " + resultsDir + "/ directory");
		System.out.println("=========================================");
	}
	
	/**
	 * Export latency data (application loop delays) to latency.json
	 */
	private static void exportLatency(Map<String, Application> applications) {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		TimeKeeper timeKeeper = TimeKeeper.getInstance();
		
		// Get latency data from TimeKeeper
		Map<Integer, Double> loopIdToAverage = timeKeeper.getLoopIdToCurrentAverage();
		
		for (Integer loopId : loopIdToAverage.keySet()) {
			JSONObject latencyEntry = new JSONObject();
			
			// Find the loop description from applications
			String loopDescription = getLoopDescription(loopId, applications);
			double averageDelay = loopIdToAverage.get(loopId);
			
			latencyEntry.put("loopId", loopId);
			latencyEntry.put("loopDescription", loopDescription != null ? loopDescription : "Loop " + loopId);
			latencyEntry.put("averageDelay", averageDelay);
			latencyEntry.put("unit", "ms");
			
			values.add(latencyEntry);
		}
		
		// If no loop data, add a default entry
		if (values.isEmpty()) {
			JSONObject defaultEntry = new JSONObject();
			defaultEntry.put("loopId", 0);
			defaultEntry.put("loopDescription", "No loop data available");
			defaultEntry.put("averageDelay", 0.0);
			defaultEntry.put("unit", "ms");
			values.add(defaultEntry);
		}
		
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_latency.json" :
			resultsDir + "/latency.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Export energy consumption data to energy.json
	 */
	private static void exportEnergy(List<FogDevice> fogDevices) {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		double totalEnergy = 0.0;
		
		for (FogDevice device : fogDevices) {
			JSONObject energyEntry = new JSONObject();
			double energy = device.getEnergyConsumption();
			totalEnergy += energy;
			
			energyEntry.put("deviceName", device.getName());
			energyEntry.put("deviceId", device.getId());
			energyEntry.put("energyConsumed", energy);
			energyEntry.put("unit", "J");
			
			values.add(energyEntry);
		}
		
		// Add total energy entry
		JSONObject totalEntry = new JSONObject();
		totalEntry.put("deviceName", "TOTAL");
		totalEntry.put("deviceId", -1);
		totalEntry.put("energyConsumed", totalEnergy);
		totalEntry.put("unit", "J");
		values.add(totalEntry);
		
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_energy.json" :
			resultsDir + "/energy.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Export network usage (bandwidth) data to bandwidth.json
	 */
	private static void exportBandwidth() {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		
		// Get network usage from NetworkUsageMonitor
		double totalNetworkUsage = NetworkUsageMonitor.getNetworkUsage();
		double averageNetworkUsage = totalNetworkUsage / Config.MAX_SIMULATION_TIME;
		
		JSONObject networkEntry = new JSONObject();
		networkEntry.put("totalNetworkUsage", totalNetworkUsage);
		networkEntry.put("averageNetworkUsage", averageNetworkUsage);
		networkEntry.put("simulationTime", Config.MAX_SIMULATION_TIME);
		networkEntry.put("unit", "bytes");
		
		values.add(networkEntry);
		
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_bandwidth.json" :
			resultsDir + "/bandwidth.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Export migration logs to migration_logs.json
	 * Uses REAL-TIME migration data captured during simulation execution
	 */
	private static void exportMigrationLogs(List<FogDevice> fogDevices) {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		
		// Get real-time migration logs from MigrationLogger
		MigrationLogger migrationLogger = MigrationLogger.getInstance();
		List<MigrationLogger.MigrationLogEntry> realTimeLogs = migrationLogger.getMigrationLogs();
		
		// Convert real-time logs to JSON format
		for (MigrationLogger.MigrationLogEntry entry : realTimeLogs) {
			// Only include logs for current algorithm
			if (!entry.algorithm.equals(algorithmName)) {
				continue;
			}
			
			JSONObject logEntry = new JSONObject();
			logEntry.put("timestamp", entry.timestamp);
			logEntry.put("simulationTime", entry.simulationTime);
			logEntry.put("algorithm", entry.algorithm);
			logEntry.put("message", "Secure data migration: " + entry.sourceDevice + " -> " + entry.targetDevice + 
				" (Module: " + entry.moduleName + ")");
			logEntry.put("sourceDevice", entry.sourceDevice);
			logEntry.put("sourceDeviceId", entry.sourceDeviceId);
			logEntry.put("targetDevice", entry.targetDevice);
			logEntry.put("targetDeviceId", entry.targetDeviceId);
			logEntry.put("moduleName", entry.moduleName);
			logEntry.put("dataSize", entry.dataSize);
			logEntry.put("unit", "bytes");
			logEntry.put("delay", entry.delay);
			logEntry.put("integrityStatus", entry.integrityStatus);
			logEntry.put("encrypted", entry.encrypted);
			
			values.add(logEntry);
		}
		
		// If no real-time migrations occurred, add a placeholder entry
		if (values.isEmpty()) {
			long baseTimestamp = System.currentTimeMillis();
			JSONObject logEntry = new JSONObject();
			logEntry.put("timestamp", baseTimestamp);
			logEntry.put("simulationTime", 0.0);
			logEntry.put("algorithm", algorithmName);
			logEntry.put("message", algorithmName + " simulation - no migrations performed during execution");
			logEntry.put("sourceDevice", "N/A");
			logEntry.put("sourceDeviceId", -1);
			logEntry.put("targetDevice", "N/A");
			logEntry.put("targetDeviceId", -1);
			logEntry.put("moduleName", "N/A");
			logEntry.put("dataSize", 0);
			logEntry.put("unit", "bytes");
			logEntry.put("delay", 0.0);
			logEntry.put("integrityStatus", "N/A");
			logEntry.put("encrypted", false);
			values.add(logEntry);
		}
		
		json.put("values", values);
		
		// Write to file
		writeJSONFile(resultsDir + "/migration_logs.json", json);
	}
	
	/**
	 * Get migration count based on algorithm
	 */
	private static int getMigrationCountForAlgorithm(FogDevice device) {
		// Different algorithms have different migration patterns
		// All algorithms now generate migrations for secure data migration tracking
		switch (algorithmName.toUpperCase()) {
			case "SCPSO":
				return 3; // More migrations due to particle swarm optimization
			case "SCCSO":
				return 2; // Moderate migrations
			case "GWO":
				return 3; // Hierarchy-based migrations
			case "HYBRID":
				return 4; // Hybrid (GWO + FL) has more migrations due to FL coordination
			case "BASELINE":
			default:
				return 2; // Baseline: standard migrations for data distribution
		}
	}
	
	/**
	 * Select target device for migration
	 */
	private static FogDevice selectTargetDevice(FogDevice sourceDevice, List<FogDevice> fogDevices) {
		// Find cloud or another fog node
		for (FogDevice device : fogDevices) {
			if (device.getId() != sourceDevice.getId()) {
				// Prefer cloud for storage migrations
				if (device.getName().equals("cloud")) {
					return device;
				}
			}
		}
		// Fallback to first available fog node
		for (FogDevice device : fogDevices) {
			if (device.getId() != sourceDevice.getId() && !device.getName().equals("cloud")) {
				return device;
			}
		}
		return sourceDevice; // Fallback
	}
	
	/**
	 * Calculate migration data size
	 */
	private static long calculateMigrationDataSize(FogDevice source, FogDevice target) {
		// Simulate data size based on device characteristics
		long baseSize = 100000; // 100 KB base
		if (target.getName().equals("cloud")) {
			return baseSize * 2; // Larger migration to cloud
		}
		return baseSize;
	}
	
	/**
	 * Export Federated Learning data in the required format
	 */
	private static void exportFederatedLearningData() {
		FederatedLearningManager flManager = FederatedLearningManager.getInstance();
		
		// Always generate fl_metrics.json, but with flEnabled=false if FL not enabled
		JSONObject json = new JSONObject();
		
		if (!flManager.isEnabled()) {
			json.put("flEnabled", false);
			json.put("rounds", 0);
			json.put("fogNodes", 0);
			json.put("localModels", new JSONArray());
			json.put("globalModel", new JSONObject());
			json.put("privacy", "N/A");
		} else {
			FLStatus status = flManager.getStatus();
			
			json.put("flEnabled", true);
			json.put("rounds", status.trainingRound);
			json.put("fogNodes", status.localModelsCount);
			
			// Local models array in required format
			JSONArray localModelsArray = new JSONArray();
			for (LocalModelSummary summary : status.localModelSummaries) {
				JSONObject localModel = new JSONObject();
				localModel.put("node", summary.deviceName);
				localModel.put("loss", summary.trainingLoss);
				localModelsArray.add(localModel);
			}
			json.put("localModels", localModelsArray);
			
			// Global model in required format
			JSONObject globalModel = new JSONObject();
			globalModel.put("loss", 1.0 - status.globalConvergence); // Convert convergence to loss
			globalModel.put("aggregation", "FedAvg");
			json.put("globalModel", globalModel);
			
			json.put("privacy", "Raw data not shared");
		}
		
		// Write to fl_metrics.json (standard filename)
		writeJSONFile(resultsDir + "/fl_metrics.json", json);
	}
	
	/**
	 * Export response time data to response_time.json
	 */
	private static void exportResponseTime(Map<String, Application> applications) {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		MetricsTracker metricsTracker = MetricsTracker.getInstance();
		TimeKeeper timeKeeper = TimeKeeper.getInstance();
		
		// Calculate average response time from TimeKeeper data
		Map<Integer, Double> emitTimes = timeKeeper.getEmitTimes();
		Map<Integer, Double> endTimes = timeKeeper.getEndTimes();
		
		double totalResponseTime = 0.0;
		int responseTimeCount = 0;
		List<Double> responseTimes = new java.util.ArrayList<>();
		
		for (Integer tupleId : emitTimes.keySet()) {
			if (endTimes.containsKey(tupleId)) {
				double responseTime = endTimes.get(tupleId) - emitTimes.get(tupleId);
				responseTimes.add(responseTime);
				totalResponseTime += responseTime;
				responseTimeCount++;
			}
		}
		
		// Calculate average
		double averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0.0;
		
		// Add per-device response time (simplified - average across all devices)
		for (String appId : applications.keySet()) {
			JSONObject entry = new JSONObject();
			entry.put("appId", appId);
			entry.put("averageResponseTime", averageResponseTime);
			entry.put("totalTasks", responseTimeCount);
			entry.put("unit", "ms");
			values.add(entry);
		}
		
		// Add overall average if no app-specific data
		if (values.isEmpty() && responseTimeCount > 0) {
			JSONObject entry = new JSONObject();
			entry.put("metric", "Overall Average");
			entry.put("averageResponseTime", averageResponseTime);
			entry.put("totalTasks", responseTimeCount);
			entry.put("unit", "ms");
			values.add(entry);
		}
		
		// If no data, add default entry
		if (values.isEmpty()) {
			JSONObject defaultEntry = new JSONObject();
			defaultEntry.put("metric", "No data available");
			defaultEntry.put("averageResponseTime", 0.0);
			defaultEntry.put("totalTasks", 0);
			defaultEntry.put("unit", "ms");
			values.add(defaultEntry);
		}
		
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_response_time.json" :
			resultsDir + "/response_time.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Export scheduling time data to scheduling_time.json
	 */
	private static void exportSchedulingTime() {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		MetricsTracker metricsTracker = MetricsTracker.getInstance();
		
		double averageSchedulingTime = metricsTracker.getAverageSchedulingTime();
		double totalSchedulingTime = metricsTracker.getTotalSchedulingTime();
		List<Double> schedulingTimes = metricsTracker.getSchedulingTimes();
		
		JSONObject entry = new JSONObject();
		entry.put("averageSchedulingTime", averageSchedulingTime);
		entry.put("totalSchedulingTime", totalSchedulingTime);
		entry.put("schedulingCount", schedulingTimes.size());
		entry.put("unit", "ms");
		
		// Add individual scheduling times
		JSONArray individualTimes = new JSONArray();
		for (Double time : schedulingTimes) {
			individualTimes.add(time);
		}
		entry.put("individualTimes", individualTimes);
		
		values.add(entry);
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_scheduling_time.json" :
			resultsDir + "/scheduling_time.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Export load balance data to load_balance.json
	 */
	private static void exportLoadBalance(List<FogDevice> fogDevices) {
		JSONObject json = new JSONObject();
		json.put("algorithm", algorithmName);
		
		JSONArray values = new JSONArray();
		MetricsTracker metricsTracker = MetricsTracker.getInstance();
		
		// Record final device loads
		metricsTracker.recordDeviceLoads(fogDevices);
		
		// Calculate imbalance score (standard deviation)
		double imbalanceScore = metricsTracker.getLoadImbalanceScore();
		
		// Get average loads per device
		Map<Integer, Double> avgLoads = metricsTracker.getAverageDeviceLoads();
		
		JSONObject summaryEntry = new JSONObject();
		summaryEntry.put("metric", "Load Imbalance Score");
		summaryEntry.put("imbalanceScore", imbalanceScore);
		summaryEntry.put("unit", "standard deviation");
		summaryEntry.put("interpretation", "Lower is better");
		values.add(summaryEntry);
		
		// Add per-device loads
		for (FogDevice device : fogDevices) {
			JSONObject deviceEntry = new JSONObject();
			deviceEntry.put("deviceName", device.getName());
			deviceEntry.put("deviceId", device.getId());
			
			Double avgLoad = avgLoads.get(device.getId());
			if (avgLoad != null) {
				deviceEntry.put("averageCpuLoad", avgLoad);
			} else {
				// Fallback: estimate from device characteristics
				double estimatedLoad = device.getLevel() * 20.0;
				deviceEntry.put("averageCpuLoad", estimatedLoad);
			}
			deviceEntry.put("unit", "percentage");
			values.add(deviceEntry);
		}
		
		json.put("values", values);
		
		// Write to file with algorithm prefix if enabled
		String fileName = useAlgorithmPrefix ? 
			resultsDir + "/" + algorithmName.toLowerCase() + "_load_balance.json" :
			resultsDir + "/load_balance.json";
		writeJSONFile(fileName, json);
	}
	
	/**
	 * Get loop description from applications
	 */
	private static String getLoopDescription(int loopId, Map<String, Application> applications) {
		for (Application app : applications.values()) {
			for (AppLoop loop : app.getLoops()) {
				if (loop.getLoopId() == loopId) {
					return loop.getModules().toString();
				}
			}
		}
		return null;
	}
	
	/**
	 * Write JSON object to file
	 */
	private static void writeJSONFile(String filePath, JSONObject json) {
		try {
			FileWriter file = new FileWriter(filePath);
			file.write(json.toJSONString());
			file.flush();
			file.close();
			System.out.println("Exported: " + filePath);
		} catch (IOException e) {
			System.err.println("Error writing JSON file: " + filePath);
			e.printStackTrace();
		}
	}
}
