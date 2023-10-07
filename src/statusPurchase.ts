import { NS } from "@ns";
import { PURCHASE_SCRIPTS, PURCHASE_SERVER_SCRIPTS, HACKNET_SCRIPTS } from "/libpurchase";

/** @param {NS} ns */
export async function main(ns: NS) {
  let action = ns.args[0];
  let type = ns.args[1];

  let scripts = PURCHASE_SCRIPTS;

  if ("hacknet" === type) {
    scripts = HACKNET_SCRIPTS;
  } else if ("pserv" === type) {
    scripts = PURCHASE_SERVER_SCRIPTS;
  }

  if (action === "stop") {
    ns.tprint("Stop Purchasing! ", (type || ""));
    for (let script of scripts) {
      if (ns.scriptRunning(script, "home")) {
        ns.scriptKill(script, "home");
      }
    }
  } else if (action === "start") {
    ns.tprint("Start Purchasing! ", (type || ""));
    for (let script of scripts) {
      if (!ns.scriptRunning(script, "home")) {
        ns.exec(script, "home");
      }
    }
  } else {
    showHelp(ns);
  }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningPurchasing(ns: NS) {
  return isRunningHacknet(ns) || isRunningPurchasingServers(ns);
}

export function isRunningHacknet(ns: NS) {
  return HACKNET_SCRIPTS.filter(it => ns.scriptRunning(it, "home")).length > 0;
}

export function isRunningPurchasingServers(ns: NS) {
  return PURCHASE_SERVER_SCRIPTS.filter(it => ns.scriptRunning(it, "home")).length > 0;
}

/** @param {NS} ns */
function showHelp(ns: NS) {
  ns.tprint("usage:");
  ns.tprint("  run statusPurchase stop");
  ns.tprint("  run statusPurchase start");
}