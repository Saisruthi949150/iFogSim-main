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
import org.fog.policy.AppModuleAllocationPolicy;
import org.fog.scheduler.StreamOperatorScheduler;
import org.fog.utils.FogLinearPowerModel;
import org.fog.utils.FogUtils;
import org.fog.utils.TimeKeeper;
import org.fog.utils.distribution.DeterministicDistribution;

/**
 * Baseline iFogSim Simulation
 * 
 * This is a simple baseline simulation for fog computing that:
 * - Creates 1 Cloud node and 2-3 Fog nodes
 * - Executes application tuples
 * - Outputs latency, energy consumption, and network usage
 * - Does NOT use any optimization algorithms (no SCPSO, SCCSO, GWO, or FL)
 * 
 * This is Step 1 of the capstone project - baseline verification.
 */
public class BaselineSimulation {
	
	static List<FogDevice> fogDevices = new ArrayList<FogDevice>();
	static List<Sensor> sensors = new ArrayList<Sensor>();
	static List<Actuator> actuators = new ArrayList<Actuator>();
	
	// Simulation parameters
	static int numOfFogNodes = 2;  // Number of fog nodes (excluding cloud)
	static double SENSOR_TRANSMISSION_TIME = 5.0;  // Time between sensor transmissions (ms)
	
	public static void main(String[] args) {
		
		Log.printLine("=========================================");
		Log.printLine("Starting Baseline iFogSim Simulation...");
		Log.printLine("=========================================");

		try {
			Log.disable();  // Disable verbose CloudSim logging
			
			// Initialize CloudSim
			int num_user = 1;  // number of cloud users
			Calendar calendar = Calendar.getInstance();
			boolean trace_flag = false;  // mean trace events

			CloudSim.init(num_user, calendar, trace_flag);

			String appId = "baseline_app";  // identifier of the application
			
			FogBroker broker = new FogBroker("broker");
			
			// Create application with modules and edges
			Application application = createApplication(appId, broker.getId());
			application.setUserId(broker.getId());
			
			// Create fog devices (Cloud + Fog nodes)
			createFogDevices(broker.getId(), appId);
			
			// Create module mapping (where to place modules)
			ModuleMapping moduleMapping = ModuleMapping.createModuleMapping();
			// Place storage module in cloud
			moduleMapping.addModuleToDevice("storageModule", "cloud");
			// Other modules will be placed by Edge-ward placement policy
			
			// Create controller to manage the simulation
			Controller controller = new Controller("master-controller", fogDevices, sensors, actuators);
			
			// Submit application to controller
			controller.submitApplication(application, 0, 
					new ModulePlacementEdgewards(fogDevices, sensors, actuators, application, moduleMapping));

			// Set simulation start time
			TimeKeeper.getInstance().setSimulationStartTime(Calendar.getInstance().getTimeInMillis());

			// Start simulation
			CloudSim.startSimulation();

			// Stop simulation
			CloudSim.stopSimulation();

			Log.printLine("=========================================");
			Log.printLine("Baseline Simulation finished!");
			Log.printLine("=========================================");
			
		} catch (Exception e) {
			e.printStackTrace();
			Log.printLine("Error occurred during simulation");
		}
	}

	/**
	 * Creates the fog devices in the physical topology
	 * Creates: 1 Cloud node + numOfFogNodes fog nodes
	 * 
	 * @param userId User ID
	 * @param appId Application ID
	 */
	private static void createFogDevices(int userId, String appId) {
		
		// Create Cloud node (apex of hierarchy)
		FogDevice cloud = createFogDevice("cloud", 
				44800,    // MIPS
				40000,    // RAM (MB)
				100,      // uplink bandwidth (Mbps)
				10000,    // downlink bandwidth (Mbps)
				0,        // level (0 = cloud)
				0.01,     // rate per MIPS
				16*103,   // busy power (W)
				16*83.25  // idle power (W)
		);
		cloud.setParentId(-1);  // Cloud has no parent
		fogDevices.add(cloud);
		
		// Create Fog nodes
		for(int i = 0; i < numOfFogNodes; i++) {
			FogDevice fogNode = createFogDevice("fog-node-" + i, 
					2800,     // MIPS
					4000,     // RAM (MB)
					10000,    // uplink bandwidth (Mbps)
					10000,    // downlink bandwidth (Mbps)
					1,        // level (1 = fog)
					0.0,      // rate per MIPS
					107.339,  // busy power (W)
					83.4333   // idle power (W)
			);
			fogNode.setParentId(cloud.getId());  // Cloud is parent
			fogNode.setUplinkLatency(50);  // Latency from fog to cloud: 50 ms
			fogDevices.add(fogNode);
			
			// Add sensor and actuator to each fog node
			Sensor sensor = new Sensor("sensor-" + i, "SENSOR", userId, appId, 
					new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
			sensors.add(sensor);
			sensor.setGatewayDeviceId(fogNode.getId());
			sensor.setLatency(2.0);  // Sensor to fog latency: 2 ms
			
			Actuator actuator = new Actuator("actuator-" + i, userId, appId, "ACTUATOR");
			actuators.add(actuator);
			actuator.setGatewayDeviceId(fogNode.getId());
			actuator.setLatency(1.0);  // Actuator to fog latency: 1 ms
		}
		
		Log.printLine("Created " + (fogDevices.size()) + " devices: 1 Cloud + " + numOfFogNodes + " Fog nodes");
	}
	
	/**
	 * Creates a fog device with specified parameters
	 * 
	 * @param nodeName Name of the device
	 * @param mips MIPS (Million Instructions Per Second)
	 * @param ram RAM in MB
	 * @param upBw Uplink bandwidth in Mbps
	 * @param downBw Downlink bandwidth in Mbps
	 * @param level Hierarchy level (0=cloud, 1=fog, etc.)
	 * @param ratePerMips Cost rate per MIPS
	 * @param busyPower Power consumption when busy (W)
	 * @param idlePower Power consumption when idle (W)
	 * @return FogDevice object
	 */
	private static FogDevice createFogDevice(String nodeName, long mips,
			int ram, long upBw, long downBw, int level, double ratePerMips, 
			double busyPower, double idlePower) {
		
		List<Pe> peList = new ArrayList<Pe>();
		peList.add(new Pe(0, new PeProvisionerOverbooking(mips)));

		int hostId = FogUtils.generateEntityId();
		long storage = 1000000;  // host storage (MB)
		int bw = 10000;  // internal bandwidth

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
	 * Creates a simple application with modules and data flow
	 * 
	 * Application structure:
	 * SENSOR -> processingModule -> storageModule -> processingModule -> ACTUATOR
	 * 
	 * @param appId Application identifier
	 * @param userId User identifier
	 * @return Application object
	 */
	@SuppressWarnings({"serial" })
	private static Application createApplication(String appId, int userId){
		
		Application application = Application.createApplication(appId, userId);
		
		// Add application modules
		application.addAppModule("processingModule", 10);  // Processing module (10 MIPS required)
		application.addAppModule("storageModule", 10);     // Storage module (10 MIPS required)
		
		// Add application edges (data flow)
		// Sensor to processing module
		application.addAppEdge("SENSOR", "processingModule", 2000, 500, "SENSOR_DATA", Tuple.UP, AppEdge.SENSOR);
		
		// Processing to storage
		application.addAppEdge("processingModule", "storageModule", 1000, 1000, "PROCESSED_DATA", Tuple.UP, AppEdge.MODULE);
		
		// Storage back to processing
		application.addAppEdge("storageModule", "processingModule", 500, 1000, "STORED_DATA", Tuple.DOWN, AppEdge.MODULE);
		
		// Processing to actuator
		application.addAppEdge("processingModule", "ACTUATOR", 1000, 500, "OUTPUT", Tuple.DOWN, AppEdge.ACTUATOR);
		
		// Define tuple mappings (selectivity)
		application.addTupleMapping("processingModule", "SENSOR_DATA", "PROCESSED_DATA", new FractionalSelectivity(1.0));
		application.addTupleMapping("storageModule", "PROCESSED_DATA", "STORED_DATA", new FractionalSelectivity(1.0));
		application.addTupleMapping("processingModule", "STORED_DATA", "OUTPUT", new FractionalSelectivity(1.0));
		
		// Define application loop to monitor latency
		// Loop: SENSOR -> processingModule -> storageModule -> processingModule -> ACTUATOR
		final AppLoop loop1 = new AppLoop(new ArrayList<String>(){{
			add("SENSOR");
			add("processingModule");
			add("storageModule");
			add("processingModule");
			add("ACTUATOR");
		}});
		List<AppLoop> loops = new ArrayList<AppLoop>(){{
			add(loop1);
		}};
		application.setLoops(loops);
		
		return application;
	}
}
