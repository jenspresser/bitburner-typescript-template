import { FilenameOrPID, NS, RunOptions } from "@ns";
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

    isRunningOnServerWithSpec(ns: NS, server: string, ...args: (string | number | boolean)[]): boolean {
        return ns.isRunning(this.scriptName, server, ...args);
    }

    isRunningOnHomeWithSpec(ns: NS, server: string, ...args: (string | number | boolean)[]): boolean {
        return this.isRunningOnServerWithSpec(ns, "home", ...args);
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

    execOnHome(ns: NS, threadOrOptions?: number | RunOptions, ...args: (string | number | boolean)[]): number {
        return this.execOnServer(ns, "home", threadOrOptions, ...args);
    }

    execOnServerArgsOnly(ns: NS, hostname: string, ...args: (string | number | boolean)[]): number {
        return ns.exec(this.scriptPath, hostname, 1, ...args);
    }

    execOnHomeArgsOnly(ns: NS, ...args: (string | number | boolean)[]): number {
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

    status(ns: NS) {
        this.execOnHomeArgsOnly(ns, "status");
    }
}

export class HackScript extends Script {
    constructor(scriptName: string) {
        super(scriptName);
    }

    execHackTask(ns: NS, serverToHackFrom: string, threads: number, target: string, sleepTime: number, batch?: number | undefined) {
        if (batch) {
            this.execOnServer(ns, serverToHackFrom, threads, target, sleepTime, batch);
        } else {
            this.execOnServer(ns, serverToHackFrom, threads, target, sleepTime);
        }
    }

    isRunningHackTask(ns: NS, serverToHackFrom: string, target: string) {
        return this.isRunningOnServerWithSpec(ns, serverToHackFrom, target);
    }
}

export const STATUS_SCRIPT_EXECUTORS: StatusScriptExecutor[] = [];

export function getStatusScriptExecutor(name: string): StatusScriptExecutor {
    let executor = STATUS_SCRIPT_EXECUTORS.find(it => it.statusName === name);

    if (executor) {
        return executor;
    }

    throw "StatusScriptExecutor with name [" + name + "] not registered! Registered name: " + STATUS_SCRIPT_EXECUTORS.map(it => it.statusName);
}

export interface HasStatus {
    getStatus(ns: NS): [string, string];
}
export interface HasRunningStatus extends HasStatus {
    isRunning(ns: NS): boolean;
}
export interface CanStartStop {
    start(ns: NS): void;
    stop(ns: NS): void;
    restart(ns: NS): void;
}

export abstract class StatusScriptExecutor implements HasRunningStatus, CanStartStop {
    statusName: string;
    statusOutput: string;

    constructor(statusName: string, statusOutput: string) {
        this.statusName = statusName;
        this.statusOutput = statusOutput;
    }

    onMain(ns: NS) {
        const action = ns.args[0];
        if ("start" === action) {
            this.start(ns);
        } else if ("stop" === action) {
            this.stop(ns);
        } else if ("restart" === action) {
            this.stop(ns);
            this.start(ns);
        }
    }

    getStatus(ns: NS): [string, string] {
        return [this.statusOutput, "" + this.isRunning(ns)];
    }

    restart(ns: NS) {
        this.stop(ns);
        this.start(ns);
    }

    abstract start(ns: NS): void;
    abstract stop(ns: NS): void;
    abstract isRunning(ns: NS): boolean;
    abstract neededStartRam(ns: NS): number;
}

export abstract class SingleScriptOnHomeStatusScript extends StatusScriptExecutor {
    script: Script;
    constructor(script: Script, statusName: string, statusOutput: string) {
        super(statusName, statusOutput);
        this.script = script;
    }

    start(ns: NS): void {
        ns.tprint("Start " + this.statusName);
        if (!this.script.isRunningOnHome(ns)) {
            this.script.execOnHome(ns);
        }
    }

    stop(ns: NS): void {
        ns.tprint("Stop " + this.statusName);
        this.script.killOnHome(ns);
    }

    isRunning(ns: NS): boolean {
        return this.script.isRunningOnHome(ns);
    }

    neededStartRam(ns: NS): number {
        return this.script.ram(ns);
    }
}



// Hacknet Script
export const HACKNET = new Script("keepBuyingHacknet.js");

// Pserv Scripts
export const PSERV = new Script("keepBuyingPserv.js");

// Stock Script
export const STOCK = new Script("stocks/stockTrader5.js");

// Share Script
export const SHARE = new Script("share/share.js");

// Hack Scripts
export const MASTERHACK = new Script("hack/masterHack.js");
export const HACK = new HackScript("hack/hack.js");
export const GROW = new HackScript("hack/grow.js");
export const WEAKEN = new HackScript("hack/weaken.js");
export const DISTRIBUTEHACK = new Script("hack/distributeHack.js");
export const ALL_HACK_SCRIPTS = [MASTERHACK, HACK, GROW, WEAKEN];

// Purchase Scripts
export const HACKNET_SCRIPTS = [
    HACKNET
];
export const PURCHASE_SERVER_SCRIPTS = [
    PSERV
]

export const PURCHASE_SCRIPTS = PURCHASE_SERVER_SCRIPTS.concat(HACKNET_SCRIPTS);

export const ALL_HOME_SCRIPTS = PURCHASE_SCRIPTS.concat([DISTRIBUTEHACK]);

// Gang Scripts
export const GANG = new Script("gang/gang.js");

// Status Scripts
export const STATUSHACKING = new StatusScript("statusHacking.js");
export const STATUSSHARING = new StatusScript("statusShare.js");
export const STATUSGANG = new StatusScript("statusGang.js");



