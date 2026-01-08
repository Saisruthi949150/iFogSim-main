package org.fog.placement;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fog.application.AppModule;
import org.fog.entities.FogDevice;
import org.fog.entities.Sensor;
import org.fog.entities.Actuator;
import org.fog.application.Application;
import org.fog.utils.AlgorithmType;
import org.fog.utils.MetricsTracker;

/**
 * Optimized Module Placement
 * Implements simple versions of SCPSO, SCCSO, and GWO algorithms
 * Each algorithm affects task placement and produces different results
 */
public class OptimizedModulePlacement extends ModulePlacement {
    
    private AlgorithmType algorithm;
    private List<Sensor> sensors;
    private List<Actuator> actuators;
    private ModuleMapping moduleMapping;
    
    public OptimizedModulePlacement(List<FogDevice> fogDevices, List<Sensor> sensors, 
                                   List<Actuator> actuators, Application application,
                                   ModuleMapping moduleMapping, AlgorithmType algorithm) {
        setFogDevices(fogDevices);
        setApplication(application);
        this.sensors = sensors;
        this.actuators = actuators;
        this.moduleMapping = moduleMapping;
        this.algorithm = algorithm;
        
        // Initialize maps
        setDeviceToModuleMap(new HashMap<>());
        setModuleToDeviceMap(new HashMap<>());
        
        // Perform module mapping
        mapModules();
    }
    
    @Override
    protected void mapModules() {
        // Track scheduling time
        long startTime = System.nanoTime();
        
        // Get all modules from application
        List<AppModule> modules = getApplication().getModules();
        
        // Apply algorithm-specific placement logic to get device-to-module mapping
        Map<Integer, List<String>> deviceToModuleNames = new HashMap<>();
        
        switch (algorithm) {
            case BASELINE:
                deviceToModuleNames = getBaselinePlacement(modules);
                break;
            case SCPSO:
                deviceToModuleNames = getSCPSOPlacement(modules);
                break;
            case SCCSO:
                deviceToModuleNames = getSCCSOPlacement(modules);
                break;
            case GWO:
                deviceToModuleNames = getGWOPlacement(modules);
                break;
            default:
                deviceToModuleNames = getBaselinePlacement(modules);
        }
        
        // Record scheduling time
        long endTime = System.nanoTime();
        double schedulingTimeMs = (endTime - startTime) / 1e6; // Convert nanoseconds to milliseconds
        MetricsTracker.getInstance().recordSchedulingTime(schedulingTimeMs);
        
        // Create module instances on devices
        Map<Integer, List<AppModule>> deviceToModuleMap = new HashMap<>();
        Map<String, List<Integer>> moduleToDeviceMap = new HashMap<>();
        
        for (Map.Entry<Integer, List<String>> entry : deviceToModuleNames.entrySet()) {
            int deviceId = entry.getKey();
            FogDevice device = getFogDeviceById(deviceId);
            
            if (device == null) continue;
            
            List<AppModule> moduleList = new ArrayList<>();
            for (String moduleName : entry.getValue()) {
                AppModule module = getApplication().getModuleByName(moduleName);
                if (module != null) {
                    // Create module instance on device
                    if (createModuleInstanceOnDevice(module, device)) {
                        moduleList.add(module);
                        
                        // Update module to device map
                        if (!moduleToDeviceMap.containsKey(moduleName)) {
                            moduleToDeviceMap.put(moduleName, new ArrayList<>());
                        }
                        moduleToDeviceMap.get(moduleName).add(deviceId);
                    }
                }
            }
            deviceToModuleMap.put(deviceId, moduleList);
        }
        
        // Update maps
        setDeviceToModuleMap(deviceToModuleMap);
        setModuleToDeviceMap(moduleToDeviceMap);
    }
    
    /**
     * Baseline placement: Simple edge-ward placement
     * Returns map of device ID to list of module names
     */
    private Map<Integer, List<String>> getBaselinePlacement(List<AppModule> modules) {
        // Local map uses module names (String). A separate method later
        // converts this structure to actual AppModule instances.
        Map<Integer, List<String>> deviceToModuleMap = new HashMap<>();
        
        // Find cloud device
        FogDevice cloud = null;
        for (FogDevice device : getFogDevices()) {
            if (device.getName().equals("cloud")) {
                cloud = device;
                break;
            }
        }
        
        // Place storage module in cloud (if exists)
        for (AppModule module : modules) {
            if (module.getName().equals("storageModule") && cloud != null) {
                if (!deviceToModuleMap.containsKey(cloud.getId())) {
                    deviceToModuleMap.put(cloud.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(cloud.getId()).add(module.getName());
            }
        }
        
        // Place other modules on fog nodes (closest to sensors)
        for (AppModule module : modules) {
            if (!module.getName().equals("storageModule")) {
                // Find closest fog node to sensors
                FogDevice bestFog = findClosestFogToSensors();
                if (bestFog != null) {
                    if (!deviceToModuleMap.containsKey(bestFog.getId())) {
                        deviceToModuleMap.put(bestFog.getId(), new ArrayList<>());
                    }
                    deviceToModuleMap.get(bestFog.getId()).add(module.getName());
                }
            }
        }
        
        return deviceToModuleMap;
    }
    
    /**
     * SCPSO (Sequence Cover Particle Swarm Optimization) Placement
     * Optimizes for sequence-based task placement with particle swarm behavior
     */
    private Map<Integer, List<String>> getSCPSOPlacement(List<AppModule> modules) {
        Map<Integer, List<String>> deviceToModuleMap = new HashMap<>();
        
        FogDevice cloud = null;
        List<FogDevice> fogNodes = new ArrayList<>();
        for (FogDevice device : getFogDevices()) {
            if (device.getName().equals("cloud")) {
                cloud = device;
            } else {
                fogNodes.add(device);
            }
        }
        
        // SCPSO: Optimize placement based on sequence coverage
        // Place storage in cloud
        for (AppModule module : modules) {
            if (module.getName().equals("storageModule") && cloud != null) {
                if (!deviceToModuleMap.containsKey(cloud.getId())) {
                    deviceToModuleMap.put(cloud.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(cloud.getId()).add(module.getName());
            }
        }
        
        // SCPSO optimization: Distribute processing modules across fog nodes
        // to minimize latency (particle swarm inspired - explores multiple placements)
        int fogIndex = 0;
        for (AppModule module : modules) {
            if (!module.getName().equals("storageModule") && !fogNodes.isEmpty()) {
                // Round-robin distribution with optimization bias
                FogDevice selectedFog = fogNodes.get(fogIndex % fogNodes.size());
                
                // SCPSO: Prefer fog nodes with lower current load
                FogDevice bestFog = selectedFog;
                double minLoad = getDeviceLoad(selectedFog);
                for (FogDevice fog : fogNodes) {
                    double load = getDeviceLoad(fog);
                    if (load < minLoad) {
                        minLoad = load;
                        bestFog = fog;
                    }
                }
                
                if (!deviceToModuleMap.containsKey(bestFog.getId())) {
                    deviceToModuleMap.put(bestFog.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(bestFog.getId()).add(module.getName());
                fogIndex++;
            }
        }
        
        return deviceToModuleMap;
    }
    
    /**
     * SCCSO (Sequence Cover Cat Swarm Optimization) Placement
     * Optimizes using cat swarm behavior - seeking and tracing modes
     */
    private Map<Integer, List<String>> getSCCSOPlacement(List<AppModule> modules) {
        Map<Integer, List<String>> deviceToModuleMap = new HashMap<>();
        
        FogDevice cloud = null;
        List<FogDevice> fogNodes = new ArrayList<>();
        for (FogDevice device : getFogDevices()) {
            if (device.getName().equals("cloud")) {
                cloud = device;
            } else {
                fogNodes.add(device);
            }
        }
        
        // SCCSO: Cat swarm optimization - seeking mode (exploration)
        // Place storage in cloud
        for (AppModule module : modules) {
            if (module.getName().equals("storageModule") && cloud != null) {
                if (!deviceToModuleMap.containsKey(cloud.getId())) {
                    deviceToModuleMap.put(cloud.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(cloud.getId()).add(module.getName());
            }
        }
        
        // SCCSO: Cat swarm - prefer devices with better connectivity
        // (tracing mode - exploitation)
        for (AppModule module : modules) {
            if (!module.getName().equals("storageModule") && !fogNodes.isEmpty()) {
                FogDevice bestFog = null;
                double bestScore = Double.MAX_VALUE;
                
                for (FogDevice fog : fogNodes) {
                    // Score based on connectivity and proximity
                    double score = fog.getUplinkLatency() + 
                                  (fog.getLevel() * 10) + 
                                  getDeviceLoad(fog);
                    if (score < bestScore) {
                        bestScore = score;
                        bestFog = fog;
                    }
                }
                
                if (bestFog != null) {
                    if (!deviceToModuleMap.containsKey(bestFog.getId())) {
                        deviceToModuleMap.put(bestFog.getId(), new ArrayList<>());
                    }
                    deviceToModuleMap.get(bestFog.getId()).add(module.getName());
                }
            }
        }
        
        return deviceToModuleMap;
    }
    
    /**
     * GWO (Grey Wolf Optimization) Placement
     * Optimizes using grey wolf hierarchy (alpha, beta, delta, omega)
     */
    private Map<Integer, List<String>> getGWOPlacement(List<AppModule> modules) {
        Map<Integer, List<String>> deviceToModuleMap = new HashMap<>();
        
        FogDevice cloud = null;
        List<FogDevice> fogNodes = new ArrayList<>();
        for (FogDevice device : getFogDevices()) {
            if (device.getName().equals("cloud")) {
                cloud = device;
            } else {
                fogNodes.add(device);
            }
        }
        
        // GWO: Grey Wolf hierarchy - rank devices by performance
        // Place storage in cloud
        for (AppModule module : modules) {
            if (module.getName().equals("storageModule") && cloud != null) {
                if (!deviceToModuleMap.containsKey(cloud.getId())) {
                    deviceToModuleMap.put(cloud.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(cloud.getId()).add(module.getName());
            }
        }
        
        // GWO: Rank fog devices (alpha = best, beta = second, etc.)
        List<FogDevice> rankedFogs = new ArrayList<>(fogNodes);
        rankedFogs.sort((f1, f2) -> {
            double score1 = f1.getUplinkLatency() + getDeviceLoad(f1);
            double score2 = f2.getUplinkLatency() + getDeviceLoad(f2);
            return Double.compare(score1, score2);
        });
        
        // GWO: Use alpha (best) and beta (second best) for placement
        for (AppModule module : modules) {
            if (!module.getName().equals("storageModule") && !rankedFogs.isEmpty()) {
                // Alternate between alpha and beta wolves
                FogDevice selectedFog = rankedFogs.get(deviceToModuleMap.size() % Math.min(2, rankedFogs.size()));
                
                if (!deviceToModuleMap.containsKey(selectedFog.getId())) {
                    deviceToModuleMap.put(selectedFog.getId(), new ArrayList<>());
                }
                deviceToModuleMap.get(selectedFog.getId()).add(module.getName());
            }
        }
        
        return deviceToModuleMap;
    }
    
    /**
     * Helper: Find closest fog node to sensors
     */
    private FogDevice findClosestFogToSensors() {
        if (getFogDevices().isEmpty() || sensors.isEmpty()) {
            return getFogDevices().size() > 1 ? getFogDevices().get(1) : null;
        }
        
        // Simple: return first fog node (not cloud)
        for (FogDevice device : getFogDevices()) {
            if (!device.getName().equals("cloud")) {
                return device;
            }
        }
        return null;
    }
    
    /**
     * Helper: Calculate device load (simple metric)
     */
    private double getDeviceLoad(FogDevice device) {
        // Simple load calculation based on device level and latency
        return device.getLevel() * 5.0 + device.getUplinkLatency() * 0.1;
    }
}
