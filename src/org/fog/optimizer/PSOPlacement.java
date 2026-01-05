package org.fog.placement.optimizer;

import java.util.*;
import org.fog.entities.FogDevice;
import org.fog.application.AppModule;
import org.fog.placement.ModulePlacement;

public class PSOPlacement extends ModulePlacement {

    class Particle {
        double[] position;
        double[] velocity;
        double fitness;
        double[] bestPos;
        double bestFitness;
        Particle(int dim){
            position = new double[dim];
            velocity = new double[dim];
            for(int i=0;i<dim;i++){
                position[i] = Math.random();
                velocity[i] = Math.random()*0.1;
            }
            bestPos = position.clone();
        }
    }

    private int swarmSize = 20, maxIter = 50;
    private double w = 0.5, c1 = 1.5, c2 = 1.5;

    public PSOPlacement(List<FogDevice> fogDevices, List<AppModule> modules){
        super();
        // You can call runPSO here to find placements
        runPSO(fogDevices.size(), modules.size());
    }

    private void runPSO(int numDevices, int numModules){
        List<Particle> swarm = new ArrayList<>();
        for(int i=0;i<swarmSize;i++) swarm.add(new Particle(numModules));

        double[] gbest = swarm.get(0).bestPos.clone();
        double gbestFitness = Double.MAX_VALUE;

        for(int iter=0;iter<maxIter;iter++){
            for(Particle p: swarm){
                p.fitness = evaluate(p.position, numDevices);
                if(p.fitness < p.bestFitness){
                    p.bestFitness = p.fitness;
                    p.bestPos = p.position.clone();
                }
                if(p.bestFitness < gbestFitness){
                    gbestFitness = p.bestFitness;
                    gbest = p.bestPos.clone();
                }
            }
            for(Particle p: swarm){
                for(int d=0; d<p.position.length; d++){
                    double r1 = Math.random(), r2 = Math.random();
                    p.velocity[d] = w*p.velocity[d] + c1*r1*(p.bestPos[d]-p.position[d])
                                   + c2*r2*(gbest[d]-p.position[d]);
                    p.position[d] += p.velocity[d];
                    p.position[d] = Math.max(0, Math.min(1, p.position[d]));
                }
            }
        }
        System.out.println("Best fitness found: " + gbestFitness);
    }

    private double evaluate(double[] pos, int numDevices){
        // basic evaluation: lower = better (simulate latency)
        double latency = 0;
        for(double x: pos) latency += Math.abs(x - 0.5);
        return latency; // Replace with actual iFogSim metrics later
    }
}
