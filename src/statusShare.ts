import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";
import { SHARE } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  let servers = ["home"].concat(getServersWithRootAccess(ns));

  if ("start" === ns.args[0]) {
    for (let server of servers) {
      startSharing(ns, server);
    }
  } else if ("stop" === ns.args[0]) {
    for (let server of servers) {
      stopSharing(ns, server);
    }
  } else if ("status" === ns.args[0]) {
    let isRunning = isRunningSharing(ns);

    ns.tprint("\tSharing: ", isRunning);
  }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningSharing(ns: NS) {
  return SHARE.isRunningOnHome(ns);
}

/**
 * @param {NS} ns
 * @param {string} server
 */
function stopSharing(ns: NS, server: string) {
  if (isRunningSharing(ns)) {
    ns.scriptKill(SHARE.scriptPath, server);
  }
}

/** 
 * @param {NS} ns 
 * @param {string} server
*/
function startSharing(ns: NS, server: string) {
  let shareRam = SHARE.ram(ns);
  let availRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

  let threads = Math.floor(availRam / shareRam);

  if (threads > 0) {
    ns.exec(SHARE.scriptPath, server, threads);
  }
}