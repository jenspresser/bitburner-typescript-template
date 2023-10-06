import { NS } from "@ns";
import {
  SCRIPT_AUTODISTRIBUTE,
  SCRIPTNAME_AUTODISTRIBUTE,
  SCRIPTNAME_MASTERHACK,
  SCRIPT_MASTERHACK,
  SCRIPTNAME_DISTRIBUTEHACK,
  SCRIPT_DISTRIBUTEHACK,
  ALL_HACK_SCRIPTS
} from "/hack/libhack";
import { getServersWithRootAccess } from "/libserver";

/** @param {NS} ns */
export async function main(ns) {
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
export function restartHacking(ns) {
  stopHacking(ns);
  startHacking(ns);
}

/**
 * @param {NS} ns
 */
export function startHacking(ns) {
  ns.tprint("Start Hacking!");

  if (!ns.scriptRunning(SCRIPTNAME_AUTODISTRIBUTE, "home")) {
    ns.exec(SCRIPT_AUTODISTRIBUTE, "home");
  }
}

/**
 * @param {NS} ns
 */
export function stopHacking(ns) {
  ns.tprint("Stop Hacking!");

  if (ns.scriptRunning(SCRIPTNAME_AUTODISTRIBUTE, "home")) {
    ns.scriptKill(SCRIPT_AUTODISTRIBUTE, "home");
  }
  if (ns.scriptRunning(SCRIPTNAME_DISTRIBUTEHACK, "home")) {
    ns.scriptKill(SCRIPT_DISTRIBUTEHACK, "home");
  }

  for (var server of getServersWithRootAccess(ns)) {
    for (var hackScript of ALL_HACK_SCRIPTS) {
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
export function isRunningHacking(ns) {
  return ns.scriptRunning(SCRIPTNAME_AUTODISTRIBUTE, "home");
}

/** @param {NS} ns */
function showHelp(ns) {
  ns.tprint("usage:");
  ns.tprint("  run statusHacking stop");
  ns.tprint("  run statusHacking start");
}