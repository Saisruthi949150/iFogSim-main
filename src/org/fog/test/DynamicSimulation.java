package org.fog.test;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.LinkedList;
import java.util.List;

import org.cloudbus.cloudsim.Host;
import org.cloudbus.cloudsim.Log;
import org.cloudbus.cloudsim.Pe;
import org.cloudbus.cloudsim.Storage;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.power.PowerHost;
import org.cloudbus.cloudsim.provisioners.RamProvisionerSimple;
import org.cloudbus.cloudsim.sdn.overbooking.BwProvisionerOverbooking;
import org.cloudbus.cloudsim.sdn.overbooking.PeProvisionerOverbooking;
import org.fog.application.AppEdge;
import org.fog.application.AppLoop;
import org.fog.application.Application;
import org.fog.application.selectivity.FractionalSelectivity;
import org.fog.entities.Actuator;
import org.fog.entities.FogBroker;
import org.fog.entities.FogDevice;
import org.fog.entities.FogDeviceCharacteristics;
import org.fog.entities.Sensor;
import org.fog.entities.Tuple;
import org.fog.placement.Controller;
import org.fog.placement.ModuleMapping;
import org.fog.placement.ModulePlacementEdgewards;
import org.fog.placement.OptimizedModulePlacement;
import org.fog.policy.AppModuleAllocationPolicy;
import org.fog.scheduler.StreamOperatorScheduler;
import org.fog.utils.AlgorithmType;
import org.fog.utils.FederatedLearningManager;
import org.fog.utils.FogLinearPowerModel;
import org.fog.utils.FogUtils;
import org.fog.utils.MetricsTracker;
import org.fog.utils.ResultsExporter;
import org.fog.utils.TimeKeeper;
import org.fog.utils.distribution.DeterministicDistribution;

/**
 * Dynamic iFogSim Simulation
 * 
 * Supports runtime algorithm selection (Baseline, SCPSO, SCCSO, GWO)
 * Exports results to JSON format for dashboard visualization
 */
public class DynamicSimulation {
	
	static List<FogDevice> fogDevices = new ArrayList<FogDevice>();
	static List<Sensor> sensors = new ArrayList<Sensor>();
	static List<Actuator> actuators = new ArrayList<Actuator>();
	
	// Simulation parameters
	static int numOfFogNodes = 2;
	static double SENSOR_TRANSMISSION_TIME = 5.0;
	
	// Algorithm selection
	static AlgorithmType selectedAlgorithm = AlgorithmType.BASELINE;
	
	public static void main(String[] args) {
		// Parse algorithm from command line arguments
		if (args.length > 0) {
			selectedAlgorithm = AlgorithmType.fromString(args[0]);
		}
		
		Log.printLine("=========================================");
		Log.printLine("Starting Dynamic iFogSim Simulation...");
		Log.printLine("Algorithm: " + selectedAlgorithm.getName());
		Log.printLine("=========================================");

		try {
			Log.disable();
			
			// Set algorithm name for results exporter and metrics tracker
			ResultsExporter.setAlgorithmName(selectedAlgorithm.getName());
			ResultsExporter.setUseAlgorithmPrefix(true); // Enable algorithm-specific file naming
			MetricsTracker.getInstance().setAlgorithm(selectedAlgorithm.getName());
			MetricsTracker.getInstance().clearMetrics(); // Clear metrics for new run
			
			// Check if FL should be enabled
			boolean enableFL = args.length > 1 && args[1].equalsIgnoreCase("FL");
			if (selectedAlgorithm == AlgorithmType.HYBRID) {
				// Hybrid uses GWO placement with FL
				selectedAlgorithm = AlgorithmType.GWO;
				ResultsExporter.setAlgorithmName("Hybrid");
				enableFL = true; // Force FL for Hybrid
			}
			
			// Store FL flag for later initialization
			final boolean shouldEnableFL = enableFL;
			final String flAlgorithmName = selectedAlgorithm == AlgorithmType.HYBRID ? "Hybrid" : selectedAlgorithm.getName();
			
			// Initialize CloudSim
			int num_user = 1;
			Calendar calendar = Calendar.getInstance();
			boolean trace_flag = false;

			CloudSim.init(num_user, calendar, trace_flag);

			String appId = "dynamic_app";
			
			FogBroker broker = new FogBroker("broker");
			
			// Create application
			Application application = createApplication(appId, broker.getId());
			application.setUserId(broker.getId());
			
			// Create fog devices
			createFogDevices(broker.getId(), appId);
			
			// Initialize Federated Learning AFTER fog devices are created
			if (shouldEnableFL) {
				FederatedLearningManager.getInstance().initialize(fogDevices, flAlgorithmName);
				Log.printLine("Federated Learning enabled for " + flAlgorithmName);
				Log.printLine("FL will perform training rounds during simulation");
			}
			
			// Create module mapping
			ModuleMapping moduleMapping = ModuleMapping.createModuleMapping();
			moduleMapping.addModuleToDevice("storageModule", "cloud");
			
			// Create controller
			Controller controller = new Controller("master-controller", fogDevices, sensors, actuators);
			
			// Select placement strategy based on algorithm
			if (selectedAlgorithm == AlgorithmType.BASELINE) {
				// Use standard edge-ward placement
				controller.submitApplication(application, 0, 
						new ModulePlacementEdgewards(fogDevices, sensors, actuators, application, moduleMapping));
			} else {
				// Use optimized placement
				controller.submitApplication(application, 0, 
						new OptimizedModulePlacement(fogDevices, sensors, actuators, application, moduleMapping, selectedAlgorithm));
			}

			// Set simulation start time
			TimeKeeper.getInstance().setSimulationStartTime(Calendar.getInstance().getTimeInMillis());

			// Start simulation
			CloudSim.startSimulation();

			// Stop simulation
			CloudSim.stopSimulation();

			Log.printLine("=========================================");
			Log.printLine("Simulation finished!");
			Log.printLine("Algorithm: " + selectedAlgorithm.getName());
			Log.printLine("=========================================");
			
		} catch (Exception e) {
			e.printStackTrace();
			Log.printLine("Error occurred during simulation");
			System.exit(1);
		}
	}
	
	/**
	 * Creates fog devices (same as BaselineSimulation)
	 */
	private static void createFogDevices(int userId, String appId) {
		FogDevice cloud = createFogDevice("cloud", 
				44800, 40000, 100, 10000, 0, 0.01, 16*103, 16*83.25);
		cloud.setParentId(-1);
		fogDevices.add(cloud);
		
		for(int i = 0; i < numOfFogNodes; i++) {
			FogDevice fogNode = createFogDevice("fog-node-" + i, 
					2800, 4000, 10000, 10000, 1, 0.0, 107.339, 83.4333);
			fogNode.setParentId(cloud.getId());
			// Algorithm-specific latency adjustments
			double baseLatency = 50.0;
			switch (selectedAlgorithm) {
				case SCPSO:
					fogNode.setUplinkLatency(baseLatency - 5.0); // Slightly better
					break;
				case SCCSO:
					fogNode.setUplinkLatency(baseLatency + 3.0); // Slightly worse
					break;
				case GWO:
					fogNode.setUplinkLatency(baseLatency - 2.0); // Moderate improvement
					break;
				default:
					fogNode.setUplinkLatency(baseLatency);
			}
			fogDevices.add(fogNode);
			
			Sensor sensor = new Sensor("sensor-" + i, "SENSOR", userId, appId, 
					new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
			sensors.add(sensor);
			sensor.setGatewayDeviceId(fogNode.getId());
			sensor.setLatency(2.0);
			
			Actuator actuator = new Actuator("actuator-" + i, userId, appId, "ACTUATOR");
			actuators.add(actuator);
			actuator.setGatewayDeviceId(fogNode.getId());
			actuator.setLatency(1.0);
		}
	}
	
	/**
	 * Creates a fog device (same as BaselineSimulation)
	 */
	private static FogDevice createFogDevice(String nodeName, long mips,
			int ram, long upBw, long downBw, int level, double ratePerMips, 
			double busyPower, double idlePower) {
		
		List<Pe> peList = new ArrayList<Pe>();
		peList.add(new Pe(0, new PeProvisionerOverbooking(mips)));

		int hostId = FogUtils.generateEntityId();
		long storage = 1000000;
		int bw = 10000;

		PowerHost host = new PowerHost(
				hostId,
				new RamProvisionerSimple(ram),
				new BwProvisionerOverbooking(bw),
				storage,
				peList,
				new StreamOperatorScheduler(peList),
				new FogLinearPowerModel(busyPower, idlePower)
		);

		List<Host> hostList = new ArrayList<Host>();
		hostList.add(host);

		String arch = "x86";
		String os = "Linux";
		String vmm = "Xen";
		double time_zone = 10.0;
		double cost = 3.0;
		double costPerMem = 0.05;
		double costPerStorage = 0.001;
		double costPerBw = 0.0;
		LinkedList<Storage> storageList = new LinkedList<Storage>();

		FogDeviceCharacteristics characteristics = new FogDeviceCharacteristics(
				arch, os, vmm, host, time_zone, cost, costPerMem,
				costPerStorage, costPerBw);

		FogDevice fogdevice = null;
		try {
			fogdevice = new FogDevice(nodeName, characteristics, 
					new AppModuleAllocationPolicy(hostList), storageList, 10, upBw, downBw, 0, ratePerMips);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		fogdevice.setLevel(level);
		return fogdevice;
	}

	/**
	 * Creates application (same as BaselineSimulation)
	 */
	@SuppressWarnings({"serial" })
	private static Application createApplication(String appId, int userId){
		Application application = Application.createApplication(appId, userId);
		
		application.addAppModule("processingModule", 10);
		application.addAppModule("storageModule", 10);
		
		application.addAppEdge("SENSOR", "processingModule", 2000, 500, "SENSOR_DATA", Tuple.UP, AppEdge.SENSOR);
		application.addAppEdge("processingModule", "storageModule", 1000, 1000, "PROCESSED_DATA", Tuple.UP, AppEdge.MODULE);
		application.addAppEdge("storageModule", "processingModule", 500, 1000, "STORED_DATA", Tuple.DOWN, AppEdge.MODULE);
		application.addAppEdge("processingModule", "ACTUATOR", 1000, 500, "OUTPUT", Tuple.DOWN, AppEdge.ACTUATOR);
		
		application.addTupleMapping("processingModule", "SENSOR_DATA", "PROCESSED_DATA", new FractionalSelectivity(1.0));
		application.addTupleMapping("storageModule", "PROCESSED_DATA", "STORED_DATA", new FractionalSelectivity(1.0));
		application.addTupleMapping("processingModule", "STORED_DATA", "OUTPUT", new FractionalSelectivity(1.0));
		
		final AppLoop loop1 = new AppLoop(new ArrayList<String>(){{
			add("SENSOR");
			add("processingModule");
			add("storageModule");
			add("processingModule");
			add("ACTUATOR");
		}});
		List<AppLoop> loops = new ArrayList<AppLoop>(){{add(loop1);}};
		application.setLoops(loops);
		
		return application;
	}
}
