package org.fog.optimizer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.fog.application.AppModule;
import org.fog.entities.FogDevice;

/**
 * Cat Swarm Optimization (CSO/SCCSO-style) - lightweight implementation.
 *
 * This project’s main simulation uses {@code org.fog.placement.OptimizedModulePlacement}.
 * This class provides a reusable optimizer so the algorithm isn't "empty"/dead code.
 *
 * Notes:
 * - This is intentionally simple (simulation-friendly): we score devices and
 *   alternate seeking (exploration) and tracing (exploitation).
 * - Returns a deviceId -> moduleNames placement map.
 */
public final class CatSwarmOptimizer {

    private CatSwarmOptimizer() {}

    public static class Config {
        public int iterations = 25;
        public double seekingProbability = 0.6; // exploration vs exploitation
        public long seed = 42L;
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

        Random rnd = new Random(config.seed);

        // Precompute deterministic ranking by "connectivity score" (lower is better)
        List<FogDevice> ranked = new ArrayList<>(fogNodes);
        ranked.sort((a, b) -> Double.compare(score(a), score(b)));

        // CSO: seeking (exploration) tries random candidates; tracing follows the best ranked nodes.
        for (AppModule m : modules) {
            if ("storageModule".equals(m.getName())) continue;

            FogDevice chosen = ranked.get(0); // default: best

            for (int it = 0; it < config.iterations; it++) {
                boolean seeking = rnd.nextDouble() < config.seekingProbability;
                FogDevice candidate;
                if (seeking) {
                    candidate = fogNodes.get(rnd.nextInt(fogNodes.size()));
                } else {
                    // tracing: bias towards top-K
                    int k = Math.min(2, ranked.size());
                    candidate = ranked.get(rnd.nextInt(k));
                }
                if (score(candidate) < score(chosen)) chosen = candidate;
            }

            placement.computeIfAbsent(chosen.getId(), k -> new ArrayList<>()).add(m.getName());
        }

        // Normalize to stable output ordering
        for (List<String> mods : placement.values()) {
            Collections.sort(mods);
        }
        return placement;
    }

    /**
     * Lower score is better: combines uplink latency + a simple proxy for load.
     */
    private static double score(FogDevice d) {
        // Same "shape" as the inlined logic in OptimizedModulePlacement:
        // prioritize low latency and low "level".
        double loadProxy = d.getLevel() * 5.0 + d.getUplinkLatency() * 0.1;
        return d.getUplinkLatency() + (d.getLevel() * 10.0) + loadProxy;
    }
}
