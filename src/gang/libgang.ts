import { NS } from "@ns";
import { canRunGangOnHome } from "/libram";
import { GANG } from "/libscripts";

export function getGangScriptRam(ns: NS) : number {
    return GANG.ram(ns);
}

export function canRunGang(ns: NS) : boolean {
    return getGangScriptServer(ns) !== undefined;
}

export function getGangScriptServer(ns: NS) : string|undefined {
    if(canRunGangOnHome(ns)) {
        return "home"
    } 

    const IRON_GYM = "iron-gym";

    if(ns.hasRootAccess(IRON_GYM)) {
        return IRON_GYM;
    }

    return undefined;
}

export function statusGangOutput(ns: NS) : string {
    const isRunning = GANG.isRunningOnAnyServers(ns);

    if(!isRunning) {
        return "false";
    }

    return "on " + getGangScriptServer(ns);
}