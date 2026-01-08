package org.fog.utils;

/**
 * Algorithm Type Enum
 * Defines available optimization algorithms for fog computing simulation
 */
public enum AlgorithmType {
    BASELINE("Baseline"),
    SCPSO("SCPSO"),
    SCCSO("SCCSO"),
    GWO("GWO"),
    HYBRID("Hybrid"); // GWO + Federated Learning
    
    private final String name;
    
    AlgorithmType(String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
    
    public static AlgorithmType fromString(String str) {
        if (str == null) return BASELINE;
        str = str.toUpperCase().trim();
        try {
            return valueOf(str);
        } catch (IllegalArgumentException e) {
            return BASELINE;
        }
    }
}
