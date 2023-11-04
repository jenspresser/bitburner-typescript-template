import { NS, RunOptions } from "@ns";
import { getServersWithRootAccess } from "./libserver";

export class Script {
    scriptName: string;
    scriptPath: string;

    constructor(scriptName: string) {
        this.scriptName = scriptName;
        this.scriptPath = "/" + scriptName;
    }

    ram(ns: NS): number {
        return ns.getScriptRam(this.scriptName);
    }

    isRunningOnHome(ns: NS): boolean {
        return this.isRunningOnServer(ns, "home");
    }

    isRunningOnServer(ns: NS, server: string): boolean {
        return ns.scriptRunning(this.scriptName, server);
    }

    isRunningOnTheseServers(ns: NS): string[] {
        return getServersWithRootAccess(ns)
            .filter(server => this.isRunningOnServer(ns, server))
    }

    isRunningOnAnyServers(ns: NS): boolean {
        return this.isRunningOnTheseServers(ns).length > 0;
    }

    killOnServer(ns: NS, server: string) {
        if (this.isRunningOnServer(ns, server)) {
            ns.scriptKill(this.scriptName, server);
        }
    }

    killOnHome(ns: NS) {
        this.killOnServer(ns, "home");
    }

    execOnServer(ns: NS, hostname: string, threadOrOptions?: number | RunOptions, ...args: (string | number | boolean)[]): number {
        return ns.exec(this.scriptPath, hostname, threadOrOptions, ...args);
    }

    execOnHome(ns: NS, threadOrOptions?: number | RunOptions, ...args: (string | number | boolean)[]) : number {
        return this.execOnServer(ns, "home", threadOrOptions, ...args);
    }

    execOnServerArgsOnly(ns: NS, hostname: string, ...args: (string | number | boolean)[]): number {
        return ns.exec(this.scriptPath, hostname, 1, ...args);
    }

    execOnHomeArgsOnly(ns: NS, ...args: (string | number | boolean)[]) : number {
        return this.execOnServer(ns, "home", 1, ...args);
    }
}

export class StatusScript extends Script {
    constructor(scriptName: string) {
        super(scriptName);
    }

    stop(ns: NS) {
        this.execOnHomeArgsOnly(ns, "stop");
    }

    start(ns: NS) {
        this.execOnHomeArgsOnly(ns, "start");
    }
}

// Purchase Scripts
export const HACKNET_SCRIPTS = [
    "keepBuyingHacknet.js"
].map(it => new Script(it));
export const PURCHASE_SERVER_SCRIPTS = [
    "purchaseServers.js",
    "upgradeServers.js",
].map(it => new Script(it));

export const PURCHASE_SCRIPTS = PURCHASE_SERVER_SCRIPTS.concat(HACKNET_SCRIPTS);

// Stock Script
export const STOCK = new Script("stocks/stockTrader5.js");

// Share Script
export const SHARE = new Script("share/share.js");

// Hack Scripts
export const MASTERHACK = new Script("hack/masterHack.js");
export const HACK = new Script("hack/hack.js");
export const GROW = new Script("hack/grow.js");
export const WEAKEN = new Script("hack/weaken.js");

export const ALL_HACK_SCRIPTS = [MASTERHACK, HACK, GROW, WEAKEN];

export const DISTRIBUTEHACK = new Script("hack/distributeHack.js");

export const ALL_HOME_SCRIPTS = PURCHASE_SCRIPTS.concat([DISTRIBUTEHACK]);

// Gang Scripts
export const GANG = new Script("gang/gang.js");

// Status Scripts
export const STATUSPURCHASE = new StatusScript("statusPurchase.js");
export const STATUSHACKING = new StatusScript("statusHacking.js");
export const STATUSSHARING = new StatusScript("statusShare.js");
export const STATUSGANG = new StatusScript("statusGang.js");



