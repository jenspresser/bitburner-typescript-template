import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";

export const SHARE_SCRIPT = "/share/share.js";

/** @param {NS} ns */
export async function main(ns: NS) {
  let servers = ["home"].concat(getServersWithRootAccess(ns));

  if ("start" === ns.args[0]) {
    for (var server of servers) {
      startSharing(ns, server);
    }
  } else if ("stop" === ns.args[0]) {
    for (var server of servers) {
      stopSharing(ns, server);
    }
  } else if ("status" === ns.args[0]) {
    let isRunning = ns.scriptRunning(SHARE_SCRIPT, "home");

    ns.tprint("\tSharing: ", isRunning);
  }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningSharing(ns: NS) {
  return ns.scriptRunning(SHARE_SCRIPT, "home");
}

/**
 * @param {NS} ns
 * @param {string} server
 */
function stopSharing(ns: NS, server: string) {
  if (ns.scriptRunning(SHARE_SCRIPT, server)) {
    ns.scriptKill(SHARE_SCRIPT, server);
  }
}

/** 
 * @param {NS} ns 
 * @param {string} server
*/
function startSharing(ns: NS, server: string) {
  let shareRam = ns.getScriptRam(SHARE_SCRIPT);
  let availRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);

  let threads = Math.floor(availRam / shareRam);

  if (threads > 0) {
    ns.exec(SHARE_SCRIPT, server, threads);
  }
}