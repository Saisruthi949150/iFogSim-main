package org.fog.optimizer;

import java.util.List;

import org.fog.entities.FogDevice;
import org.fog.utils.FederatedLearningManager;

/**
 * Federated Learning helper (demo-level).
 *
 * Your simulation already uses {@link FederatedLearningManager} (see
 * {@code org.fog.test.DynamicSimulation} and {@code org.fog.placement.Controller}).
 *
 * This class exists to avoid an "empty" FL optimizer file and to provide a simple
 * entry point for triggering FL rounds programmatically.
 */
public final class FederatedLearning {

    private FederatedLearning() {}

    /**
     * Initialize FL and run a small number of rounds immediately.
     * (In the actual simulation, rounds are scheduled by Controller events.)
     */
    public static FederatedLearningManager.FLStatus runWarmupRounds(
            List<FogDevice> fogDevices,
            String algorithmName,
            int rounds
    ) {
        FederatedLearningManager fl = FederatedLearningManager.getInstance();
        fl.initialize(fogDevices, algorithmName);
        for (int i = 0; i < rounds; i++) {
            fl.performTrainingRound();
        }
        return fl.getStatus();
    }
}
