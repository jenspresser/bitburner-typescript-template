import { NS } from "@ns";
import {
	SCRIPTNAME_MASTERHACK,
	SCRIPT_MASTERHACK,
	SCRIPTNAME_DISTRIBUTEHACK,
	SCRIPT_DISTRIBUTEHACK,
	ALL_HACK_SCRIPTS
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
    ns.exec(SCRIPT_DISTRIBUTEHACK, "home");
  }
}

/**
 * @param {NS} ns
 */
export function stopHacking(ns: NS) {
  ns.tprint("Stop Hacking!");

  if (ns.scriptRunning(SCRIPTNAME_DISTRIBUTEHACK, "home")) {
    ns.scriptKill(SCRIPT_DISTRIBUTEHACK, "home");
  }

  for (let server of getServersWithRootAccess(ns)) {
    for (let hackScript of ALL_HACK_SCRIPTS) {
      if (ns.scriptRunning(hackScript, server)) {
        ns.scriptKill(hackScript, server);
      }
    }
    if (ns.scriptRunning(SCRIPTNAME_MASTERHACK, server)) {
      ns.scriptKill(SCRIPT_MASTERHACK, server);
    }
  }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningHacking(ns: NS): boolean {
  return ns.scriptRunning(SCRIPTNAME_DISTRIBUTEHACK, "home");
}

/** @param {NS} ns */
function showHelp(ns: NS) {
  ns.tprint("usage:");
  ns.tprint("  run statusHacking stop");
  ns.tprint("  run statusHacking start");
  ns.tprint("  run statusHacking restart");
}