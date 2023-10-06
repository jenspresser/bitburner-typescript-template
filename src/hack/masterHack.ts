import { NS } from "@ns";
import { calcHomeReserveRam } from "/initHome.js";
import { PURCHASE_SERVER_PREFIX } from "/libserver";
import { getNextHackTarget, SCRIPT_HACK, SCRIPT_GROW, SCRIPT_WEAKEN } from "/hack/libhack";

/** @param {NS} ns **/
export async function main(ns: NS) {
	// Parameters
	// param 1: Server you want to hack
	// param 2: OPTIONAL - Server you want to start the hack from, i.e. any public servers, purchased servers or 'home'
	//
	// EXAMPLE 1: run masterHack.js joesguns
	// This will start hacking 'joesguns' using the RAM of 'joesguns'
	//
	// EXAMPLE 2: run masterHack.js joesguns s1
	// This will start hacking 'joesguns' using the RAM of my purchased server 's1'
	//
	// This 'masterHack.js' process will stay active on whatever server you execute it from.
	// I usually start it from 'home', then I can track all my earnings in one place.
	// Keep in mind, when using 'home' as second parameter the script might use all available RAM
	// and you might become unable to execute any other scripts on 'home' until you kill the process.

	let target = await getNextHackTarget(ns);

	const serverToHackFrom = ns.getHostname(); // For single argument calls - server will hack itself
	const hackScript = SCRIPT_HACK;
	const growScript = SCRIPT_GROW;
	const weakenScript = SCRIPT_WEAKEN;

	const hackScriptRAM = ns.getScriptRam(hackScript);
	const growScriptRAM = ns.getScriptRam(growScript);
	const weakenScriptRAM = ns.getScriptRam(weakenScript);

	const serverMaxMoney = ns.getServerMaxMoney(target);
	const moneyThresh = serverMaxMoney * 0.9; // 0.90 to maintain near 100% server money.  You can use 0.75 when starting out/using low thread counts
	const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
	const sleepDelay = 200; // Sleep delay should range between 20ms and 200ms as per the documentation. I'll keep the default at 200, adjust as needed. 

	let currentServerMoney, currentServerSecurity;
	let useThreadsHack, useThreadsWeaken1, useThreadsWeaken2, useThreadsGrow, possibleThreads;
	let maxHackFactor = 0.01;
	let growWeakenRatio = 0.9; // How many threads are used for growing vs. weaking (90:10).
	let sleepTime, sleepTimeHack, sleepTimeGrow, sleepTimeWeaken;
	let i, batches, batchSize;
	let playerLevel = ns.getHackingLevel();

	let serverMaxRAM = getServerRam(ns, serverToHackFrom);
	let isHighRamServer = serverMaxRAM >= 32;

	// Use max of 4 batches up to 4 TB server size. Min batchSize is 256 GB.
	if (serverMaxRAM < 4096) {
		batchSize = Math.max(serverMaxRAM / 4, 256);
	} else {
		batchSize = 512;
	}

	// To prevent the script from crashing/terminating after closing and restarting the game.
	while (ns.isRunning(hackScript, serverToHackFrom, target)
		|| ns.isRunning(growScript, serverToHackFrom, target)
		|| ns.isRunning(weakenScript, serverToHackFrom, target)
	) {
		await ns.sleep(10000);
	}

	// Main loop - will terminate if no RAM available
	while (3 < (possibleThreads = Math.floor((serverMaxRAM - ns.getServerUsedRam(serverToHackFrom)) / growScriptRAM))) {
		currentServerMoney = ns.getServerMoneyAvailable(target);
		currentServerSecurity = ns.getServerSecurityLevel(target);
		sleepTimeHack = ns.getHackTime(target);
		sleepTimeGrow = ns.getGrowTime(target);
		sleepTimeWeaken = ns.getWeakenTime(target);
		// The first two cases are for new servers with high SECURITY LEVELS and to quickly grow the server to above the threshold
		if (currentServerSecurity > securityThresh) {
			ns.print("Focus: Weaken Security: " + target);
			let weakenThreads = Math.floor(possibleThreads / 2);
			let growThreads = Math.ceil(possibleThreads / 2)

			if (weakenThreads > 0) {
				ns.print("\tExecute weaken with " + weakenThreads + " threads");
				ns.exec(weakenScript, serverToHackFrom, weakenThreads, target, 0);
			}

			if (growThreads > 0) {
				let availableRam = getAvailableRam(ns, serverToHackFrom);
				let growThreadRam = growThreads * growScriptRAM;
				if (growThreadRam > availableRam) {
					growThreads = Math.floor(availableRam / growScriptRAM);
				}

				ns.print("\tExecute grow with " + growThreads + " threads");
				ns.exec(growScript, serverToHackFrom, growThreads, target, 0);
			}

			let waitTime = sleepTimeWeaken + sleepDelay;

			ns.print("\tWait for " + ns.tFormat(waitTime));
			await ns.sleep(waitTime); // wait for the weaken command to finish
		} else if (currentServerMoney < moneyThresh) {
			ns.print("Focus: Grow Money: " + target);
			let growThreads = Math.floor(possibleThreads * growWeakenRatio);
			let weakenThreads = Math.ceil(possibleThreads * (1 - growWeakenRatio));

			if (growThreads > 0) {
				ns.print("\tExecute grow with " + growThreads + " threads");
				ns.exec(growScript, serverToHackFrom, growThreads, target, 0);
			}
			if (weakenThreads > 0) {
				let availableRam = getAvailableRam(ns, serverToHackFrom);
				let weakenThreadRam = weakenThreads * weakenScriptRAM;

				if (weakenThreadRam > availableRam) {
					weakenThreadRam = Math.floor(availableRam / weakenScriptRAM);
				}

				ns.print("\tExecute weaken with " + weakenThreads + " threads");
				ns.exec(weakenScript, serverToHackFrom, weakenThreads, target, 0);
			}

			let waitTime = sleepTimeWeaken + sleepDelay;
			if (weakenThreads == 0) {
				waitTime = sleepTimeGrow + sleepDelay;
			}
			ns.print("\tWait for " + ns.tFormat(waitTime));
			await ns.sleep(waitTime); // wait for the weaken command to finish
		} else {
			ns.print("Focus: Hacking: " + target + "(isHighRamServer: " + isHighRamServer + ")");

			// Define max amount that can be restored with one grow and therefore will be used to define hack threads.
			// The max grow threads are considering the weaken threads needed to weaken hack security and the weaken threads needed to weaken grow security.
			// I didn't bother optimizing the 'growWeakenRatio' further, as 90% is good enough already. It will be just a few more hack threads, if any at all - even with large RAM sizes.
			batches = Math.max(Math.floor((sleepTimeHack) / (3 * sleepDelay)), 1); // This way at least 1 batch will run
			batches = Math.min(batches, Math.ceil(serverMaxRAM / batchSize)); // Use just as many batches as batchSize allows
			possibleThreads = Math.floor(possibleThreads / batches);
			while (maxHackFactor < 0.999 &&
				Math.floor((possibleThreads - (useThreadsHack = Math.floor(ns.hackAnalyzeThreads(target, currentServerMoney * maxHackFactor))) - Math.ceil(useThreadsHack / 25)) * growWeakenRatio)
				> Math.ceil(ns.growthAnalyze(target, serverMaxMoney / (serverMaxMoney * (1 - maxHackFactor))))) {
				maxHackFactor += 0.001; // increase by 0.1% with each iteration
			}
			maxHackFactor -= 0.001; // Since it's more than 'possibleThreads' can handle now, we need to dial it back once.
			useThreadsHack = Math.max(Math.floor(ns.hackAnalyzeThreads(target, currentServerMoney * maxHackFactor)), 1); // Forgot this in the first version.
			useThreadsWeaken1 = Math.ceil(useThreadsHack / 25); // You can weaken the security of 25 hack threads with 1 weaken thread
			useThreadsGrow = Math.floor((possibleThreads - useThreadsWeaken1 - useThreadsHack) * growWeakenRatio);
			useThreadsWeaken2 = possibleThreads - useThreadsHack - useThreadsGrow - useThreadsWeaken1;
			sleepTime = sleepDelay;

			ns.print("Use " + batches + " batches.");

			for (i = 0; i < batches; i++) {
				ns.print("Batch " + i);
				if (isHighRamServer) {
					if (useThreadsWeaken1 > 0) {
						ns.print("\tExec weaken1 with " + useThreadsWeaken1 + " threads");
						ns.exec(weakenScript, serverToHackFrom, useThreadsWeaken1, target, 0, 0 + 2 * i);
					}
					sleepTime = 2 * sleepDelay;
				}
				if (isHighRamServer) {
					if (useThreadsWeaken2 > 0) {
						ns.print("\tExec weaken2 with " + useThreadsWeaken2 + " threads");
						ns.exec(weakenScript, serverToHackFrom, useThreadsWeaken2, target, sleepTime, 1 + 2 * i); // Second weaken script runs after the first
					}
					sleepTime = sleepTimeWeaken - sleepTimeGrow + sleepDelay;
				}
				if (isHighRamServer) {
					if (useThreadsGrow > 0) {
						ns.print("\tExec grow with " + useThreadsGrow + " threads");
						ns.exec(growScript, serverToHackFrom, useThreadsGrow, target, sleepTime, i); // Grow script ends before second weaken script
					}
					sleepTime = sleepTimeWeaken - sleepTimeHack - sleepDelay;
				}
				if (useThreadsHack > 0) {
					let hackThreadRam = useThreadsHack * hackScriptRAM;
					let availableRam = getAvailableRam(ns, serverToHackFrom);

					if (hackThreadRam > availableRam) {
						useThreadsHack = Math.floor(availableRam / hackScriptRAM);
					}

					ns.print("\tExec hack with " + useThreadsHack + " threads");
					ns.exec(hackScript, serverToHackFrom, useThreadsHack, target, sleepTime, i); // Hack script ends before first weaken script
				}
				await ns.sleep(3 * sleepDelay);
			}

			// When we have high ram servers, let the master sleep the whole weaken time cycle.
			// If not a high ram server, then only hack is executed and we only sleep for hacktime
			let sleepTimeMaster = (isHighRamServer ? sleepTimeWeaken : sleepTimeHack) + sleepDelay;
			ns.print("");
			ns.print("\tWait for " + ns.tFormat(sleepTimeMaster));
			await ns.sleep(sleepTimeMaster);
			maxHackFactor = 0.01;
		}

		if (serverToHackFrom.startsWith(PURCHASE_SERVER_PREFIX) || serverToHackFrom === "home") {
			// For Home and Purchased Servers the Max RAM can change, reevaliate this after each loop
			let newRam = getServerRam(ns, serverToHackFrom);

			if (newRam > serverMaxRAM) {
				ns.print("Available RAM increased, setting new serverMaxRAM to " + ns.formatRam(newRam));
				serverMaxRAM = newRam;
			}
		}

		if (ns.getHackingLevel() > playerLevel) {
			await ns.sleep(Math.random() * 1000);
			target = await getNextHackTarget(ns);
			ns.print("Player HackLevel increased, reevaluate target to: ", target);
		}
	}
	ns.print("Script was terminated. Not enough RAM available on '" + serverToHackFrom + "'.")
}

/**
 * @param {NS} ns
 * @param {string} serverToHackFrom
 * @returns {number}
 */
function getServerRam(ns: NS, serverToHackFrom: string): number {
	let serverMaxRAM = ns.getServerMaxRam(serverToHackFrom);

	if ("home" === serverToHackFrom) {
		serverMaxRAM = serverMaxRAM - calcHomeReserveRam(ns);
	}

	return serverMaxRAM;
}

/**
 * @param {NS} ns
 * @param {string} serverToHackFrom
 * @returns {number}
 */
function getAvailableRam(ns: NS, serverToHackFrom: string): number {
	return Math.max(0, getServerRam(ns, serverToHackFrom) - ns.getServerUsedRam(serverToHackFrom));
}