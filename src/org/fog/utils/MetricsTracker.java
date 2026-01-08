package org.fog.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.cloudbus.cloudsim.core.CloudSim;
import org.fog.entities.FogDevice;
import org.fog.entities.Tuple;

/**
 * MetricsTracker
 * 
 * Tracks evaluation metrics for fog computing simulations:
 * - Response Time: Time between task generation and task completion
 * - Scheduling Time: Time taken by scheduling algorithm execution
 * - Load Balancing Index: CPU utilization imbalance across fog nodes
 */
public class MetricsTracker {
	
	private static MetricsTracker instance;
	
	// Response Time tracking
	private Map<Integer, Double> tupleResponseTimes; // tupleId -> response time (ms)
	private List<Double> allResponseTimes; // All response times for averaging
	
	// Scheduling Time tracking
	private List<Double> schedulingTimes; // List of scheduling algorithm execution times (ms)
	private String currentAlgorithm;
	
	// Load Balancing tracking
	private Map<Integer, Double> deviceLoads; // deviceId -> CPU load (utilization %)
	private List<Map<Integer, Double>> loadSnapshots; // Historical load snapshots
	
	private MetricsTracker() {
		tupleResponseTimes = new HashMap<>();
		allResponseTimes = new ArrayList<>();
		schedulingTimes = new ArrayList<>();
		deviceLoads = new HashMap<>();
		loadSnapshots = new ArrayList<>();
		currentAlgorithm = "Baseline";
	}
	
	public static MetricsTracker getInstance() {
		if (instance == null) {
			instance = new MetricsTracker();
		}
		return instance;
	}
	
	/**
	 * Set the current algorithm name
	 */
	public void setAlgorithm(String algorithm) {
		this.currentAlgorithm = algorithm;
	}
	
	/**
	 * Clear all metrics for a new simulation run
	 */
	public void clearMetrics() {
		tupleResponseTimes.clear();
		allResponseTimes.clear();
		schedulingTimes.clear();
		deviceLoads.clear();
		loadSnapshots.clear();
	}
	
	// ==================== RESPONSE TIME TRACKING ====================
	
	/**
	 * Record task generation time (tuple emission)
	 * Called when tuple is created/emitted
	 */
	public void recordTaskGeneration(int tupleId, double simulationTime) {
		// Response time is tracked via TimeKeeper's emitTimes and endTimes
		// This method can be used for additional tracking if needed
	}
	
	/**
	 * Record task completion and calculate response time
	 * Called when tuple processing completes
	 */
	public void recordTaskCompletion(int tupleId, double generationTime, double completionTime) {
		if (generationTime > 0 && completionTime >= generationTime) {
			double responseTime = completionTime - generationTime;
			tupleResponseTimes.put(tupleId, responseTime);
			allResponseTimes.add(responseTime);
		}
	}
	
	/**
	 * Calculate average response time (ms)
	 */
	public double getAverageResponseTime() {
		if (allResponseTimes.isEmpty()) {
			return 0.0;
		}
		double sum = 0.0;
		for (Double rt : allResponseTimes) {
			sum += rt;
		}
		return sum / allResponseTimes.size();
	}
	
	/**
	 * Get response time per fog node (average)
	 * Uses TimeKeeper data to correlate tuples to devices
	 */
	public Map<Integer, Double> getResponseTimePerDevice(List<FogDevice> devices) {
		Map<Integer, Double> deviceResponseTimes = new HashMap<>();
		Map<Integer, Integer> deviceCounts = new HashMap<>();
		
		// Initialize maps
		for (FogDevice device : devices) {
			deviceResponseTimes.put(device.getId(), 0.0);
			deviceCounts.put(device.getId(), 0);
		}
		
		// Get response times from TimeKeeper
		TimeKeeper timeKeeper = TimeKeeper.getInstance();
		Map<Integer, Double> emitTimes = timeKeeper.getEmitTimes();
		Map<Integer, Double> endTimes = timeKeeper.getEndTimes();
		
		for (Integer tupleId : emitTimes.keySet()) {
			if (endTimes.containsKey(tupleId)) {
				double responseTime = endTimes.get(tupleId) - emitTimes.get(tupleId);
				// For simplicity, average across all devices
				// In a real implementation, you'd track which device processed each tuple
				for (Integer deviceId : deviceResponseTimes.keySet()) {
					double currentSum = deviceResponseTimes.get(deviceId);
					int currentCount = deviceCounts.get(deviceId);
					deviceResponseTimes.put(deviceId, currentSum + responseTime);
					deviceCounts.put(deviceId, currentCount + 1);
				}
			}
		}
		
		// Calculate averages
		for (Integer deviceId : deviceResponseTimes.keySet()) {
			int count = deviceCounts.get(deviceId);
			if (count > 0) {
				deviceResponseTimes.put(deviceId, deviceResponseTimes.get(deviceId) / count);
			}
		}
		
		return deviceResponseTimes;
	}
	
	// ==================== SCHEDULING TIME TRACKING ====================
	
	/**
	 * Record scheduling algorithm execution time
	 * @param schedulingTime Time taken by scheduling algorithm in milliseconds
	 */
	public void recordSchedulingTime(double schedulingTime) {
		if (schedulingTime >= 0) {
			schedulingTimes.add(schedulingTime);
		}
	}
	
	/**
	 * Get average scheduling time (ms)
	 */
	public double getAverageSchedulingTime() {
		if (schedulingTimes.isEmpty()) {
			return 0.0;
		}
		double sum = 0.0;
		for (Double st : schedulingTimes) {
			sum += st;
		}
		return sum / schedulingTimes.size();
	}
	
	/**
	 * Get total scheduling time (ms)
	 */
	public double getTotalSchedulingTime() {
		double sum = 0.0;
		for (Double st : schedulingTimes) {
			sum += st;
		}
		return sum;
	}
	
	/**
	 * Get all scheduling times for detailed analysis
	 */
	public List<Double> getSchedulingTimes() {
		return new ArrayList<>(schedulingTimes);
	}
	
	// ==================== LOAD BALANCING TRACKING ====================
	
	/**
	 * Record device load (CPU utilization) snapshot
	 * Should be called periodically during simulation
	 */
	public void recordDeviceLoads(List<FogDevice> devices) {
		Map<Integer, Double> snapshot = new HashMap<>();
		
		for (FogDevice device : devices) {
			// Calculate CPU utilization based on current load vs total MIPS
			double totalMips = device.getHost().getTotalMips();
			double currentLoad = 0.0;
			
			// Estimate current load from device characteristics
			// This is a simplified calculation - actual load would come from running tasks
			try {
				// Try to get current CPU utilization
				// For simplicity, use energy consumption as a proxy
				double energyRatio = device.getEnergyConsumption() / (totalMips * 100); // Normalize
				currentLoad = Math.min(100.0, energyRatio * 100); // Percentage
			} catch (Exception e) {
				// Fallback: estimate from device level and resources
				currentLoad = device.getLevel() * 20.0; // Rough estimate
			}
			
			snapshot.put(device.getId(), currentLoad);
			deviceLoads.put(device.getId(), currentLoad);
		}
		
		loadSnapshots.add(snapshot);
	}
	
	/**
	 * Calculate load imbalance score (standard deviation of CPU utilization)
	 * Lower score = better load balancing
	 */
	public double getLoadImbalanceScore() {
		if (deviceLoads.isEmpty()) {
			return 0.0;
		}
		
		// Calculate average load
		double sum = 0.0;
		int count = 0;
		for (Double load : deviceLoads.values()) {
			sum += load;
			count++;
		}
		if (count == 0) return 0.0;
		
		double average = sum / count;
		
		// Calculate standard deviation
		double varianceSum = 0.0;
		for (Double load : deviceLoads.values()) {
			double diff = load - average;
			varianceSum += diff * diff;
		}
		double variance = varianceSum / count;
		double stdDev = Math.sqrt(variance);
		
		return stdDev; // Standard deviation is the imbalance score
	}
	
	/**
	 * Get average load per device
	 */
	public Map<Integer, Double> getAverageDeviceLoads() {
		Map<Integer, Double> avgLoads = new HashMap<>();
		Map<Integer, Integer> counts = new HashMap<>();
		
		// Initialize
		for (Map<Integer, Double> snapshot : loadSnapshots) {
			for (Integer deviceId : snapshot.keySet()) {
				avgLoads.put(deviceId, 0.0);
				counts.put(deviceId, 0);
			}
		}
		
		// Sum loads across snapshots
		for (Map<Integer, Double> snapshot : loadSnapshots) {
			for (Map.Entry<Integer, Double> entry : snapshot.entrySet()) {
				Integer deviceId = entry.getKey();
				Double load = entry.getValue();
				
				if (avgLoads.containsKey(deviceId)) {
					avgLoads.put(deviceId, avgLoads.get(deviceId) + load);
					counts.put(deviceId, counts.get(deviceId) + 1);
				}
			}
		}
		
		// Calculate averages
		for (Integer deviceId : avgLoads.keySet()) {
			int count = counts.get(deviceId);
			if (count > 0) {
				avgLoads.put(deviceId, avgLoads.get(deviceId) / count);
			}
		}
		
		return avgLoads;
	}
	
	/**
	 * Get current algorithm name
	 */
	public String getCurrentAlgorithm() {
		return currentAlgorithm;
	}
}
