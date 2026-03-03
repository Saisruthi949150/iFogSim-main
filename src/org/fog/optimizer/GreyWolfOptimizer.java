package org.fog.optimizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fog.application.AppModule;
import org.fog.entities.FogDevice;

/**
 * Grey Wolf Optimizer (GWO) - lightweight implementation.
 *
 * This returns a placement map (deviceId -> moduleNames) based on a simplified
 * alpha/beta/delta hierarchy. It’s intentionally deterministic and fast for simulation runs.
 */
public final class GreyWolfOptimizer {

    private GreyWolfOptimizer() {}

    public static class Config {
        /** How many leader wolves to use (alpha/beta/delta). */
        public int leaders = 3;
    }

    public static Map<Integer, List<String>> computePlacement(
            List<FogDevice> fogDevices,
            List<AppModule> modules,
            Config config
    ) {
        if (config == null) config = new Config();

        FogDevice cloud = null;
        List<FogDevice> fogNodes = new ArrayList<>();
        for (FogDevice d : fogDevices) {
            if ("cloud".equalsIgnoreCase(d.getName())) cloud = d;
            else fogNodes.add(d);
        }

        Map<Integer, List<String>> placement = new HashMap<>();

        // Keep storage in cloud if present
        for (AppModule m : modules) {
            if ("storageModule".equals(m.getName()) && cloud != null) {
                placement.computeIfAbsent(cloud.getId(), k -> new ArrayList<>()).add(m.getName());
            }
        }

        if (fogNodes.isEmpty()) {
            // Fallback: everything goes to cloud
            for (AppModule m : modules) {
                if (!"storageModule".equals(m.getName()) && cloud != null) {
                    placement.computeIfAbsent(cloud.getId(), k -> new ArrayList<>()).add(m.getName());
                }
            }
            return placement;
        }

        // Rank fog devices: alpha = best (lowest score)
        List<FogDevice> ranked = new ArrayList<>(fogNodes);
        ranked.sort((a, b) -> Double.compare(score(a), score(b)));

        int leaderCount = Math.max(1, Math.min(config.leaders, ranked.size()));
        List<FogDevice> leaders = ranked.subList(0, leaderCount);

        // Place modules by rotating leaders (alpha/beta/delta), to balance load somewhat
        int idx = 0;
        for (AppModule m : modules) {
            if ("storageModule".equals(m.getName())) continue;
            FogDevice chosen = leaders.get(idx % leaders.size());
            idx++;
            placement.computeIfAbsent(chosen.getId(), k -> new ArrayList<>()).add(m.getName());
        }

        // Normalize to stable output ordering
        for (List<String> mods : placement.values()) {
            Collections.sort(mods);
        }
        return placement;
    }

    /**
     * Lower score is better: combines uplink latency + simple load proxy.
     */
    private static double score(FogDevice d) {
        double loadProxy = d.getLevel() * 5.0 + d.getUplinkLatency() * 0.1;
        return d.getUplinkLatency() + loadProxy;
    }
}
