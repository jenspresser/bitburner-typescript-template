import { NS } from "@ns";
import { STOCK } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  let action = ns.args[0];

  if (action === "stop") {
    if (isRunningStock(ns)) {
      ns.scriptKill(STOCK.scriptPath, "home");
    }
  } else if (action === "start") {
    if (!isRunningStock(ns)) {
      ns.exec(STOCK.scriptPath, "home");
    }
  }
}


/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningStock(ns: NS) {
  return STOCK.isRunningOnHome(ns);
}