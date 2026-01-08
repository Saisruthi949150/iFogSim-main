package org.fog.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.fog.entities.FogDevice;

/**
 * Federated Learning Manager
 * 
 * Manages federated learning operations at the fog layer:
 * - Local model training at each fog node
 * - Global model aggregation (FedAvg-style)
 * - Privacy-preserving parameter sharing
 * 
 * This is a lightweight simulation-level implementation.
 */
public class FederatedLearningManager {
    
    private static FederatedLearningManager instance;
    private Map<Integer, LocalModel> localModels; // Device ID -> Local Model
    private GlobalModel globalModel;
    private int trainingRound;
    private boolean enabled;
    private String algorithm;
    
    // FL Configuration
    public static final int FL_UPDATE_INTERVAL = 500; // ms
    private static final int MAX_TRAINING_ROUNDS = 10;
    
    public boolean isEnabled() {
        return enabled;
    }
    
    private FederatedLearningManager() {
        localModels = new HashMap<>();
        globalModel = new GlobalModel();
        trainingRound = 0;
        enabled = false;
    }
    
    public static FederatedLearningManager getInstance() {
        if (instance == null) {
            instance = new FederatedLearningManager();
        }
        return instance;
    }
    
    /**
     * Initialize FL for a set of fog devices
     */
    public void initialize(List<FogDevice> fogDevices, String algorithm) {
        this.algorithm = algorithm;
        this.enabled = true;
        localModels.clear();
        trainingRound = 0;
        
        // Initialize local models for each fog node (not cloud)
        for (FogDevice device : fogDevices) {
            if (!device.getName().equals("cloud") && device.getLevel() > 0) {
                localModels.put(device.getId(), new LocalModel(device.getId(), device.getName()));
            }
        }
        
        // Initialize global model
        globalModel = new GlobalModel();
        globalModel.initialize(localModels.size());
        
        System.out.println("Federated Learning initialized for " + localModels.size() + " fog nodes");
    }
    
    /**
     * Perform one round of federated learning
     */
    public void performTrainingRound() {
        if (!enabled || localModels.isEmpty()) {
            return;
        }
        
        trainingRound++;
        if (trainingRound > MAX_TRAINING_ROUNDS) {
            return;
        }
        
        // Step 1: Local training at each fog node
        for (LocalModel localModel : localModels.values()) {
            localModel.train();
        }
        
        // Step 2: Aggregate local models into global model (FedAvg)
        aggregateModels();
        
        // Step 3: Distribute global model back to local models
        distributeGlobalModel();
        
        System.out.println("FL Training Round " + trainingRound + " completed. Global convergence: " + 
                          String.format("%.4f", globalModel.getConvergence()));
    }
    
    /**
     * Aggregate local models using Federated Averaging (FedAvg)
     */
    private void aggregateModels() {
        if (localModels.isEmpty()) {
            return;
        }
        
        // Calculate weighted average of local model parameters
        double totalWeight = 0.0;
        double aggregatedValue = 0.0;
        
        for (LocalModel localModel : localModels.values()) {
            double weight = localModel.getDataSize(); // Weight by local data size
            aggregatedValue += localModel.getModelParameter() * weight;
            totalWeight += weight;
        }
        
        if (totalWeight > 0) {
            double newGlobalParameter = aggregatedValue / totalWeight;
            globalModel.update(newGlobalParameter);
        }
    }
    
    /**
     * Distribute global model parameters to local models
     */
    private void distributeGlobalModel() {
        double globalParam = globalModel.getModelParameter();
        for (LocalModel localModel : localModels.values()) {
            localModel.updateFromGlobal(globalParam);
        }
    }
    
    /**
     * Get FL status for export
     */
    public FLStatus getStatus() {
        FLStatus status = new FLStatus();
        status.trainingRound = trainingRound;
        status.globalConvergence = globalModel.getConvergence();
        status.privacyPreserved = true; // No raw data shared
        status.localModelsCount = localModels.size();
        status.algorithm = algorithm;
        
        // Collect local model summaries
        status.localModelSummaries = new ArrayList<>();
        for (LocalModel localModel : localModels.values()) {
            LocalModelSummary summary = new LocalModelSummary();
            summary.deviceId = localModel.deviceId;
            summary.deviceName = localModel.deviceName;
            summary.modelParameter = localModel.getModelParameter();
            summary.dataSize = localModel.getDataSize();
            summary.trainingLoss = localModel.getTrainingLoss();
            status.localModelSummaries.add(summary);
        }
        
        return status;
    }
    
    /**
     * Local Model (simulated at each fog node)
     */
    private static class LocalModel {
        int deviceId;
        String deviceName;
        private double modelParameter;
        private double dataSize;
        private double trainingLoss;
        private Random random;
        
        LocalModel(int deviceId, String deviceName) {
            this.deviceId = deviceId;
            this.deviceName = deviceName;
            this.random = new Random(deviceId); // Deterministic seed
            this.modelParameter = random.nextDouble() * 0.5 + 0.5; // Initialize between 0.5-1.0
            this.dataSize = 100 + random.nextInt(50); // Simulated local data size
            this.trainingLoss = 0.5;
        }
        
        void train() {
            // Simulate local training: improve model parameter
            // In real FL, this would involve actual gradient descent
            double improvement = (1.0 - modelParameter) * 0.1; // Move towards 1.0
            modelParameter += improvement;
            trainingLoss = Math.max(0.0, trainingLoss - 0.05); // Decrease loss
        }
        
        void updateFromGlobal(double globalParam) {
            // Update local model with global model (with some local adaptation)
            modelParameter = 0.7 * globalParam + 0.3 * modelParameter; // Weighted combination
        }
        
        double getModelParameter() {
            return modelParameter;
        }
        
        double getDataSize() {
            return dataSize;
        }
        
        double getTrainingLoss() {
            return trainingLoss;
        }
    }
    
    /**
     * Global Model (aggregated from local models)
     */
    private static class GlobalModel {
        private double modelParameter;
        private double convergence;
        private int updateCount;
        
        void initialize(int numNodes) {
            modelParameter = 0.5; // Initial global parameter
            convergence = 0.0;
            updateCount = 0;
        }
        
        void update(double newParameter) {
            double oldParam = modelParameter;
            modelParameter = newParameter;
            updateCount++;
            
            // Calculate convergence (how close to optimal)
            convergence = 1.0 - Math.abs(1.0 - modelParameter);
            convergence = Math.max(0.0, Math.min(1.0, convergence));
        }
        
        double getModelParameter() {
            return modelParameter;
        }
        
        double getConvergence() {
            return convergence;
        }
    }
    
    /**
     * FL Status for export
     */
    public static class FLStatus {
        public int trainingRound;
        public double globalConvergence;
        public boolean privacyPreserved;
        public int localModelsCount;
        public String algorithm;
        public List<LocalModelSummary> localModelSummaries;
    }
    
    /**
     * Local Model Summary
     */
    public static class LocalModelSummary {
        public int deviceId;
        public String deviceName;
        public double modelParameter;
        public double dataSize;
        public double trainingLoss;
    }
}
