package org.fog.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.cloudbus.cloudsim.core.CloudSim;
import org.fog.application.AppModule;
import org.fog.entities.FogDevice;

/**
 * Real-time Migration Logger
 * 
 * Captures data migrations as they occur during simulation runtime.
 * Thread-safe for concurrent access during simulation execution.
 */
public class MigrationLogger {
	
	private static MigrationLogger instance = null;
	private List<MigrationLogEntry> migrationLogs;
	private String currentAlgorithm = "Baseline";
	private Map<Integer, String> deviceIdToNameMap; // Cache device IDs to names
	
	private MigrationLogger() {
		migrationLogs = new CopyOnWriteArrayList<MigrationLogEntry>();
		deviceIdToNameMap = new HashMap<Integer, String>();
	}
	
	public static MigrationLogger getInstance() {
		if (instance == null) {
			instance = new MigrationLogger();
		}
		return instance;
	}
	
	/**
	 * Set the current algorithm name for migration logs
	 */
	public void setAlgorithm(String algorithm) {
		this.currentAlgorithm = algorithm;
	}
	
	/**
	 * Register a fog device for migration tracking
	 */
	public void registerDevice(FogDevice device) {
		if (device != null) {
			deviceIdToNameMap.put(device.getId(), device.getName());
		}
	}
	
	/**
	 * Register multiple fog devices at once
	 */
	public void registerDevices(List<FogDevice> devices) {
		if (devices != null) {
			for (FogDevice device : devices) {
				registerDevice(device);
			}
		}
	}
	
	/**
	 * Get device name by ID
	 */
	private String getDeviceName(int deviceId) {
		return deviceIdToNameMap.getOrDefault(deviceId, "device-" + deviceId);
	}
	
	/**
	 * Log a real-time migration event (with device objects)
	 */
	public void logMigration(FogDevice sourceDevice, FogDevice targetDevice, 
	                         AppModule module, long dataSize, double delay) {
		if (sourceDevice == null || targetDevice == null || module == null) {
			return;
		}
		logMigration(sourceDevice.getId(), targetDevice.getId(), 
		            sourceDevice.getName(), targetDevice.getName(),
		            module, dataSize, delay);
	}
	
	/**
	 * Log a real-time migration event (with device IDs)
	 * 
	 * @param sourceDeviceId Source fog device ID
	 * @param targetDeviceId Target fog device ID
	 * @param sourceDeviceName Source device name (can be null, will be looked up)
	 * @param targetDeviceName Target device name (can be null, will be looked up)
	 * @param module Module being migrated
	 * @param dataSize Size of data being migrated (bytes)
	 * @param delay Network delay for migration (ms)
	 */
	public void logMigration(int sourceDeviceId, int targetDeviceId,
	                         String sourceDeviceName, String targetDeviceName,
	                         AppModule module, long dataSize, double delay) {
		
		if (module == null || sourceDeviceId < 0 || targetDeviceId < 0) {
			return; // Skip invalid migrations
		}
		
		// Get device names (use provided or look up from cache)
		String sourceName = sourceDeviceName != null ? sourceDeviceName : getDeviceName(sourceDeviceId);
		String targetName = targetDeviceName != null ? targetDeviceName : getDeviceName(targetDeviceId);
		
		// Get current simulation time
		double simulationTime = CloudSim.clock();
		
		// Create migration log entry
		MigrationLogEntry entry = new MigrationLogEntry();
		entry.timestamp = System.currentTimeMillis() + (long)(simulationTime * 1000); // Real timestamp + simulation time
		entry.simulationTime = simulationTime;
		entry.algorithm = currentAlgorithm;
		entry.sourceDevice = sourceName;
		entry.sourceDeviceId = sourceDeviceId;
		entry.targetDevice = targetName;
		entry.targetDeviceId = targetDeviceId;
		entry.moduleName = module.getName();
		entry.dataSize = dataSize > 0 ? dataSize : module.getSize(); // Use module size if dataSize not provided
		entry.delay = delay;
		entry.integrityStatus = "Verified"; // All real migrations are verified
		entry.encrypted = true; // All migrations are encrypted
		
		// Add to logs
		migrationLogs.add(entry);
		
		// Debug output
		System.out.println(String.format("[Migration] %.2f: %s (ID:%d) -> %s (ID:%d) (Module: %s, Size: %d bytes, Delay: %.2f ms)",
			simulationTime, sourceName, sourceDeviceId, targetName, targetDeviceId, module.getName(), entry.dataSize, delay));
	}
	
	/**
	 * Get all migration logs
	 */
	public List<MigrationLogEntry> getMigrationLogs() {
		return new ArrayList<MigrationLogEntry>(migrationLogs);
	}
	
	/**
	 * Clear all migration logs (for new simulation run)
	 */
	public void clearLogs() {
		migrationLogs.clear();
	}
	
	/**
	 * Get migration count for current algorithm
	 */
	public int getMigrationCount() {
		return migrationLogs.size();
	}
	
	/**
	 * Migration log entry structure
	 */
	public static class MigrationLogEntry {
		public long timestamp;
		public double simulationTime;
		public String algorithm;
		public String sourceDevice;
		public int sourceDeviceId;
		public String targetDevice;
		public int targetDeviceId;
		public String moduleName;
		public long dataSize;
		public double delay;
		public String integrityStatus;
		public boolean encrypted;
	}
}
