import { NS } from "@ns";
import { getGangScriptServer } from "/gang/libgang";
import { GANG } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    let action = ns.args[0];

    if (action === "stop") {
        stopGang(ns);
    } else if (action === "start") {
        startGang(ns);
    } else if (action === "restart") {
        restartGang(ns);
    } else {
        showHelp(ns);
    }
}

export function restartGang(ns: NS) {
    stopGang(ns);
    startGang(ns);
}

export function startGang(ns: NS) {
    const gangServer = getGangScriptServer(ns);

    if (gangServer !== undefined) {
        if (!isRunningGangOnServer(ns, gangServer)) {
            ns.tprint("Starting GANG on " + gangServer);
            GANG.execOnServer(ns, gangServer);
        }
    }
}

export function stopGang(ns: NS) {
    const gangServer = getGangScriptServer(ns);

    if (gangServer !== undefined) {
        ns.tprint("Stopping GANG on " + gangServer);
        GANG.killOnServer(ns, gangServer);
    }
}

/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningGang(ns: NS): boolean {
    const gangServer = getGangScriptServer(ns);

    if (gangServer === undefined) {
        return false;
    }

    return isRunningGangOnServer(ns, gangServer);
}


/** 
 * @param {NS} ns 
 * @returns {boolean}
*/
export function isRunningGangOnServer(ns: NS, hostname: string): boolean {
    return GANG.isRunningOnServer(ns, hostname);
}

/** @param {NS} ns */
function showHelp(ns: NS) {
    ns.tprint("usage:");
    ns.tprint("  run statusGang stop");
    ns.tprint("  run statusGang start");
    ns.tprint("  run statusGang restart");
}