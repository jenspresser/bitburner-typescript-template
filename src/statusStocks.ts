import { NS } from "@ns";
export const SCRIPTNAME_STOCK = "stocks/stockTrader5.js";
export const SCRIPT_STOCK = "/" + SCRIPTNAME_STOCK;

/** @param {NS} ns */
export async function main(ns: NS) {
  let action = ns.args[0];

  if (action === "stop") {
    if (ns.scriptRunning(SCRIPTNAME_STOCK, "home")) {
      ns.scriptKill(SCRIPT_STOCK, "home");
    }
  } else if (action === "start") {
    if (!ns.scriptRunning(SCRIPTNAME_STOCK, "home")) {
      ns.exec(SCRIPT_STOCK, "home");
    }
  }
}


/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningStock(ns: NS) {
  return ns.scriptRunning(SCRIPTNAME_STOCK, "home");
}