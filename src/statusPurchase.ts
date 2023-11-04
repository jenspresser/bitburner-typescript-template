import { NS } from "@ns";
import { PURCHASE_SCRIPTS } from "./libscripts";
import { PURCHASE_SERVER_SCRIPTS } from "./libscripts";
import { HACKNET_SCRIPTS } from "./libscripts";

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
      script.killOnHome(ns);
    }
  } else if (action === "start") {
    ns.tprint("Start Purchasing! ", (type || ""));
    for (let script of scripts) {
      if (!script.isRunningOnHome(ns)) {
        script.execOnHome(ns);
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
  return HACKNET_SCRIPTS.filter(it => it.isRunningOnHome(ns)).length > 0;
}

export function isRunningPurchasingServers(ns: NS) {
  return PURCHASE_SERVER_SCRIPTS.filter(it => it.isRunningOnHome(ns)).length > 0;
}

/** @param {NS} ns */
function showHelp(ns: NS) {
  ns.tprint("usage:");
  ns.tprint("  run statusPurchase stop");
  ns.tprint("  run statusPurchase start");
}