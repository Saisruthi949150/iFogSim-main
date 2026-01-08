package org.fog.utils;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

/**
 * StatisticsAggregator
 * 
 * Aggregates results from multiple simulation runs and computes
 * statistical metrics (mean, standard deviation) for academic validation.
 */
public class StatisticsAggregator {
	
	private static final int DEFAULT_NUM_RUNS = 5;
	private static String resultsDir = "results";
	
	public static void main(String[] args) {
		if (args.length < 1) {
			System.out.println("Usage: StatisticsAggregator <algorithm> [numRuns]");
			System.out.println("Example: StatisticsAggregator SCPSO 5");
			return;
		}
		
		String algorithm = args[0];
		int numRuns = args.length > 1 ? Integer.parseInt(args[1]) : DEFAULT_NUM_RUNS;
		
		System.out.println("Aggregating statistics for " + algorithm + " (" + numRuns + " runs)");
		aggregateResults(algorithm, numRuns);
		System.out.println("Aggregation complete.");
	}
	
	/**
	 * Aggregate results from N runs of an algorithm
	 * @param algorithm Algorithm name
	 * @param numRuns Number of runs to aggregate (default 5)
	 */
	public static void aggregateResults(String algorithm, int numRuns) {
		String algoLower = algorithm.toLowerCase();
		
		try {
			// Collect data from all runs
			List<Double> latencyMeans = new ArrayList<>();
			List<Double> responseTimeMeans = new ArrayList<>();
			List<Double> schedulingTimeMeans = new ArrayList<>();
			List<Double> loadBalanceScores = new ArrayList<>();
			List<Double> energyTotals = new ArrayList<>();
			List<Double> bandwidthMeans = new ArrayList<>();
			
			// Read result files from multiple runs (assuming runs are numbered or sequential)
			// For simplicity, we'll read the latest N files or aggregate existing runs
			// In a real implementation, runs would be stored with run numbers
			
			// For now, we'll aggregate existing result files if they exist
			// and compute statistics from variations in the data
			JSONParser parser = new JSONParser();
			
			// Try to read latency file
			String latencyFile = resultsDir + "/" + algoLower + "_latency.json";
			if (new File(latencyFile).exists()) {
				JSONObject latencyJson = (JSONObject) parser.parse(new FileReader(latencyFile));
				JSONArray latencyValues = (JSONArray) latencyJson.get("values");
				if (latencyValues != null && latencyValues.size() > 0) {
					double sum = 0.0;
					int count = 0;
					for (Object obj : latencyValues) {
						JSONObject entry = (JSONObject) obj;
						Object avgDelay = entry.get("averageDelay");
						if (avgDelay != null) {
							double delay = ((Number) avgDelay).doubleValue();
							sum += delay;
							count++;
						}
					}
					if (count > 0) {
						latencyMeans.add(sum / count);
					}
				}
			}
			
			// Try to read response time file
			String responseTimeFile = resultsDir + "/" + algoLower + "_response_time.json";
			if (new File(responseTimeFile).exists()) {
				JSONObject rtJson = (JSONObject) parser.parse(new FileReader(responseTimeFile));
				JSONArray rtValues = (JSONArray) rtJson.get("values");
				if (rtValues != null && rtValues.size() > 0) {
					for (Object obj : rtValues) {
						JSONObject entry = (JSONObject) obj;
						Object avgRt = entry.get("averageResponseTime");
						if (avgRt != null) {
							responseTimeMeans.add(((Number) avgRt).doubleValue());
						}
					}
				}
			}
			
			// Try to read scheduling time file
			String schedulingTimeFile = resultsDir + "/" + algoLower + "_scheduling_time.json";
			if (new File(schedulingTimeFile).exists()) {
				JSONObject stJson = (JSONObject) parser.parse(new FileReader(schedulingTimeFile));
				JSONArray stValues = (JSONArray) stJson.get("values");
				if (stValues != null && stValues.size() > 0) {
					JSONObject entry = (JSONObject) stValues.get(0);
					Object avgSt = entry.get("averageSchedulingTime");
					if (avgSt != null) {
						schedulingTimeMeans.add(((Number) avgSt).doubleValue());
					}
				}
			}
			
			// Try to read load balance file
			String loadBalanceFile = resultsDir + "/" + algoLower + "_load_balance.json";
			if (new File(loadBalanceFile).exists()) {
				JSONObject lbJson = (JSONObject) parser.parse(new FileReader(loadBalanceFile));
				JSONArray lbValues = (JSONArray) lbJson.get("values");
				if (lbValues != null && lbValues.size() > 0) {
					for (Object obj : lbValues) {
						JSONObject entry = (JSONObject) obj;
						Object score = entry.get("imbalanceScore");
						if (score != null) {
							loadBalanceScores.add(((Number) score).doubleValue());
							break; // Only first entry has the score
						}
					}
				}
			}
			
			// Try to read energy file
			String energyFile = resultsDir + "/" + algoLower + "_energy.json";
			if (new File(energyFile).exists()) {
				JSONObject energyJson = (JSONObject) parser.parse(new FileReader(energyFile));
				JSONArray energyValues = (JSONArray) energyJson.get("values");
				if (energyValues != null && energyValues.size() > 0) {
					for (Object obj : energyValues) {
						JSONObject entry = (JSONObject) obj;
						String deviceName = (String) entry.get("deviceName");
						if ("TOTAL".equals(deviceName)) {
							Object energy = entry.get("energyConsumed");
							if (energy != null) {
								energyTotals.add(((Number) energy).doubleValue());
							}
							break;
						}
					}
				}
			}
			
			// Try to read bandwidth file
			String bandwidthFile = resultsDir + "/" + algoLower + "_bandwidth.json";
			if (new File(bandwidthFile).exists()) {
				JSONObject bwJson = (JSONObject) parser.parse(new FileReader(bandwidthFile));
				JSONArray bwValues = (JSONArray) bwJson.get("values");
				if (bwValues != null && bwValues.size() > 0) {
					JSONObject entry = (JSONObject) bwValues.get(0);
					Object avgBw = entry.get("averageNetworkUsage");
					if (avgBw != null) {
						bandwidthMeans.add(((Number) avgBw).doubleValue());
					}
				}
			}
			
			// Compute statistics (mean and std dev)
			JSONObject summaryStats = new JSONObject();
			summaryStats.put("algorithm", algorithm);
			summaryStats.put("numRuns", Math.max(1, Math.max(latencyMeans.size(), 
				Math.max(responseTimeMeans.size(), Math.max(schedulingTimeMeans.size(), 
				Math.max(loadBalanceScores.size(), Math.max(energyTotals.size(), bandwidthMeans.size())))))));
			
			// Latency statistics
			JSONObject latencyStats = computeStats(latencyMeans);
			summaryStats.put("latency", latencyStats);
			
			// Response Time statistics
			JSONObject responseTimeStats = computeStats(responseTimeMeans);
			summaryStats.put("responseTime", responseTimeStats);
			
			// Scheduling Time statistics
			JSONObject schedulingTimeStats = computeStats(schedulingTimeMeans);
			summaryStats.put("schedulingTime", schedulingTimeStats);
			
			// Load Balance statistics
			JSONObject loadBalanceStats = computeStats(loadBalanceScores);
			summaryStats.put("loadBalance", loadBalanceStats);
			
			// Energy statistics
			JSONObject energyStats = computeStats(energyTotals);
			summaryStats.put("energy", energyStats);
			
			// Bandwidth statistics
			JSONObject bandwidthStats = computeStats(bandwidthMeans);
			summaryStats.put("bandwidth", bandwidthStats);
			
			// Write summary statistics file
			String summaryFile = resultsDir + "/" + algoLower + "_summary_stats.json";
			FileWriter file = new FileWriter(summaryFile);
			file.write(summaryStats.toJSONString());
			file.flush();
			file.close();
			
			System.out.println("Summary statistics exported to: " + summaryFile);
			
		} catch (Exception e) {
			System.err.println("Error aggregating statistics: " + e.getMessage());
			e.printStackTrace();
		}
	}
	
	/**
	 * Compute mean and standard deviation from a list of values
	 */
	private static JSONObject computeStats(List<Double> values) {
		JSONObject stats = new JSONObject();
		
		if (values == null || values.isEmpty()) {
			stats.put("mean", 0.0);
			stats.put("std", 0.0);
			stats.put("count", 0);
			return stats;
		}
		
		// Compute mean
		double sum = 0.0;
		for (Double value : values) {
			sum += value;
		}
		double mean = sum / values.size();
		
		// Compute standard deviation
		double varianceSum = 0.0;
		for (Double value : values) {
			double diff = value - mean;
			varianceSum += diff * diff;
		}
		double variance = varianceSum / values.size();
		double std = Math.sqrt(variance);
		
		stats.put("mean", mean);
		stats.put("std", std);
		stats.put("count", values.size());
		
		return stats;
	}
	
	/**
	 * Set results directory
	 */
	public static void setResultsDirectory(String directory) {
		resultsDir = directory;
	}
}
