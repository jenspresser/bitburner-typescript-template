import { NS } from "@ns";
import {
  ALL_HACK_SCRIPTS,
  DISTRIBUTEHACK,
  MASTERHACK
} from "./libscripts";
import { getServersWithRootAccess } from "/libserver";

/** @param {NS} ns */
export async function main(ns: NS) {
  let action = ns.args[0];

  if (action === "stop") {
    stopHacking(ns);
  } else if (action === "start") {
    startHacking(ns);
  } else if (action === "restart") {
    restartHacking(ns);
  } else {
    showHelp(ns);
  }

}

/**
 * @param {NS} ns
 */
export function restartHacking(ns: NS) {
  stopHacking(ns);
  startHacking(ns);
}

/**
 * @param {NS} ns
 */
export function startHacking(ns: NS) {
  ns.tprint("Start Hacking!");

  if (!isRunningHacking(ns)) {
    DISTRIBUTEHACK.execOnHome(ns);
  }
}

/**
 * @param {NS} ns
 */
export function stopHacking(ns: NS) {
  ns.tprint("Stop Hacking!");

  DISTRIBUTEHACK.killOnHome(ns);

  for (let server of getServersWithRootAccess(ns)) {
    stopHackingOnServer(ns, server);
  }
}

export function stopHackingOnServer(ns: NS, server: string) {
  MASTERHACK.killOnServer(ns, server);
  
  for (let hackScript of ALL_HACK_SCRIPTS) {
    hackScript.killOnServer(ns, server);
  }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningHacking(ns: NS): boolean {
  return DISTRIBUTEHACK.isRunningOnHome(ns);
}

/** @param {NS} ns */
function showHelp(ns: NS) {
  ns.tprint("usage:");
  ns.tprint("  run statusHacking stop");
  ns.tprint("  run statusHacking start");
  ns.tprint("  run statusHacking restart");
}