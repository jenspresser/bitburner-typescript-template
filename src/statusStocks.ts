import { NS } from "@ns";
import { STOCK } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  let action = ns.args[0];

  if (action === "stop") {
    STOCK.killOnHome(ns);
  } else if (action === "start") {
    if (!isRunningStock(ns)) {
      STOCK.execOnHome(ns);
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