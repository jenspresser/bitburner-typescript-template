import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";
import { distributeScripts } from "/library";
import { calcHomeReserveRam } from "/initHome";
import { MODE_FILE_NAME, SCRIPTNAME_MASTERHACK, SCRIPT_MASTERHACK, crawlRootAccess, setTargetMode } from "/hack/libhack"


/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tprint("Start distributeHack!");
  await ns.sleep(1000);

	if (ns.fileExists(MODE_FILE_NAME)) {
		let initialTargetMode = ns.read(MODE_FILE_NAME);
		setTargetMode(ns, initialTargetMode);

		ns.tprint("Mode initialised to " + initialTargetMode);
	}

	while (true) {
    ns.print("crawlRootAccess");
		await crawlRootAccess(ns);
    ns.print("distributeScripts");
		await distributeScripts(ns);

    await ns.sleep(1000);
    ns.print("distributeHack");
    await distributeHack(ns);

		await ns.sleep(2000);
	}
}

/** @param {NS} ns */
export async function distributeHack(ns: NS) {
  await distributeScripts(ns);

  await distributeOnRootServers(ns);
  await distributeOnHome(ns);
}


/**
 * @param {NS} ns
 */
async function distributeOnRootServers(ns: NS) {
  let masters = getRootServers(ns);

  for (let master of masters) {
    await setupMasterHack(ns, master);
    await ns.sleep(Math.random() * 1000);
  }
}

/**
 * @param {NS} ns
 * @param {string} nextHackTarget
 */
async function distributeOnHome(ns: NS) {
  let homeMaxRam = ns.getServerMaxRam("home");
  let reserveRAM = calcHomeReserveRam(ns);

  let availableRam = homeMaxRam - reserveRAM;

  if (availableRam <= 0) {
    return;
  }

  await setupMasterHack(ns, "home");
}


/**
 * @param {NS} ns
 * @param {string} masterServerName
 * @param {string} slaveServerName
 */
async function setupMasterHack(ns: NS, masterServerName: string) {
  let alreadyRunning = ns.scriptRunning(SCRIPTNAME_MASTERHACK, masterServerName);

  ns.print("masterServerName=", masterServerName, " - already running? ", alreadyRunning);

  if (!alreadyRunning) {
    ns.print("setup masterHack on [", masterServerName, "]");
    ns.exec(SCRIPT_MASTERHACK, masterServerName, 1);
  }
}

/**
 * @param {NS} ns
 * @returns {string[]}
 */
function getRootServers(ns: NS) {
  return getServersWithRootAccess(ns)
    .filter(server => server !== "home")
    .filter(server => ns.getServerMaxRam(server) >= 16);
}

