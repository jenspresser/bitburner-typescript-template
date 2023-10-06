import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";
import { distributeScripts } from "/library";
import { calcHomeReserveRam } from "/initHome";
import { SCRIPTNAME_MASTERHACK, SCRIPT_MASTERHACK } from "/hack/libhack"
import { PORT_NEXT_TARGET_INDEX } from "/PORTS";



/** @param {NS} ns */
export async function main(ns) {
  await distributeScripts(ns);

  await distributeOnRootServers(ns);
  await distributeOnHome(ns);
}


/**
 * @param {NS} ns
 */
async function distributeOnRootServers(ns) {
  let masters = getRootServers(ns);

  for (var master of masters) {
    await setupMasterHack(ns, master);
    await ns.sleep(Math.random() * 1000);
  }
}

/**
 * @param {NS} ns
 * @param {string} nextHackTarget
 */
async function distributeOnHome(ns) {
  let homeMaxRam = ns.getServerMaxRam("home");
  let reserveRAM = calcHomeReserveRam(ns);

  let availableRam = homeMaxRam - reserveRAM;

  if(availableRam <= 0) {
    return;
  }
  
  await setupMasterHack(ns, "home");
}


/**
 * @param {NS} ns
 * @param {string} masterServerName
 * @param {string} slaveServerName
 */
async function setupMasterHack(ns, masterServerName) {
  let alreadyRunning = ns.scriptRunning(SCRIPTNAME_MASTERHACK, masterServerName);

  ns.print("masterServerName=", masterServerName, " - already running? ", alreadyRunning);

  if(!alreadyRunning) {
    ns.print("setup masterHack on [", masterServerName, "]");
    ns.exec(SCRIPT_MASTERHACK, masterServerName, 1);
  }
}

/**
 * @param {NS} ns
 * @returns {string[]}
 */
function getRootServers(ns) {
  return getServersWithRootAccess(ns)
    .filter(server => server !== "home")
    .filter(server => ns.getServerMaxRam(server) >= 16);
}

