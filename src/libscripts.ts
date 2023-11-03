import { NS } from "@ns";

export class Script {
    scriptName: string;

    constructor(scriptName: string) {
        this.scriptName = scriptName;
    }

    scriptPath() : string {
        return "/" + this.scriptName;
    }

    ram(ns: NS) : number {
        return ns.getScriptRam(this.scriptName);
    }

    isRunningOnHome(ns: NS) : boolean {
        return this.isRunningOnServer(ns, "home");
    }

    isRunningOnServer(ns: NS, server: string) : boolean {
        return ns.scriptRunning(this.scriptName, server);
    }
}

export class GangScript extends Script {
    constructor() {
        super("gang/gang.js");
    }
}


// Purchase Scripts
export const HACKNET_SCRIPTS = [
    "keepBuyingHacknet.js"
];
export const PURCHASE_SERVER_SCRIPTS = [
    "purchaseServers.js",
    "upgradeServers.js",
];
export const PURCHASE_SCRIPTS = PURCHASE_SERVER_SCRIPTS.concat(HACKNET_SCRIPTS);

// Stock Script
export const SCRIPTNAME_STOCK = "stocks/stockTrader5.js";
export const SCRIPT_STOCK = "/" + SCRIPTNAME_STOCK;

// Share Script
export const SHARE_SCRIPT = "/share/share.js";

// Hack Scripts
export const SCRIPTNAME_MASTERHACK = "hack/masterHack.js";
export const SCRIPT_MASTERHACK = "/" + SCRIPTNAME_MASTERHACK;

export const SCRIPTNAME_HACK = "hack/hack.js";
export const SCRIPT_HACK = "/" + SCRIPTNAME_HACK;

export const SCRIPTNAME_GROW = "hack/grow.js";
export const SCRIPT_GROW = "/" + SCRIPTNAME_GROW;

export const SCRIPTNAME_WEAKEN = "hack/weaken.js";
export const SCRIPT_WEAKEN = "/" + SCRIPTNAME_WEAKEN;

export const ALL_HACK_SCRIPTS = [SCRIPTNAME_MASTERHACK, SCRIPTNAME_HACK, SCRIPTNAME_GROW, SCRIPTNAME_WEAKEN];

export const SCRIPTNAME_DISTRIBUTEHACK = "hack/distributeHack.js";
export const SCRIPT_DISTRIBUTEHACK = "/" + SCRIPTNAME_DISTRIBUTEHACK;

// Gang Scripts
export const SCRIPT_GANG = new GangScript();

export const ALL_HOME_SCRIPTS = PURCHASE_SCRIPTS.concat([SCRIPT_DISTRIBUTEHACK]);



