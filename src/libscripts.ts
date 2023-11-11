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

export abstract class StatusScript implements HasRunningStatus, CanStartStop {
    statusName: string;
    statusOutput: string;
    statusAlias?: string;

    constructor(statusName: string, statusOutput: string, statusAlias?: string) {
        this.statusName = statusName;
        this.statusOutput = statusOutput;
        this.statusAlias = statusAlias;
    }

    onMain(ns: NS) {
        const action = ns.args[0];

        this.onAction(ns, String(action));
    }

    onAction(ns: NS, action: string) {
        if ("start" === action) {
            this.beforeStart(ns);
            this.start(ns);
            this.afterStart(ns);
        } else if ("stop" === action) {
            this.beforeStop(ns);
            this.stop(ns);
            this.afterStop(ns);
        } else if ("restart" === action) {
            this.stop(ns);
            this.start(ns);
        }
    }

    getModuleNames() {
        if (this.statusAlias) {
            return [this.statusAlias, this.statusName]
        } else {
            return [this.statusName];
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

    beforeStart(ns: NS) { }
    afterStart(ns: NS) { }
    beforeStop(ns: NS) { }
    afterStop(ns: NS) { }
}

export abstract class SingleScriptOnHomeStatusScript extends StatusScript {
    script: Script;
    constructor(script: Script, statusName: string, statusOutput: string, statusAlias?: string) {
        super(statusName, statusOutput, statusAlias);
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

export abstract class DistributedTaskStatusScript extends StatusScript {
    script: Script;
    constructor(script: Script, statusName: string, statusOutput: string, statusAlias?: string) {
        super(statusName, statusOutput, statusAlias);
        this.script = script;
    }

    start(ns: NS): void {
        ns.tprint("Start " + this.statusName);
        this.getRunOnServers(ns).forEach(server => this.startOnServer(ns, server));
    }

    stop(ns: NS): void {
        ns.tprint("Stop " + this.statusName);
        this.getKillOnServers(ns).forEach(server => this.stopOnServer(ns, server));
    }

    isRunning(ns: NS): boolean {
        return this.determineRunStatus(ns);
    }

    neededStartRam(ns: NS): number {
        return this.script.ram(ns);
    }

    startOnServer(ns: NS, server: string) {
        if (!this.script.isRunningOnServer(ns, server)) {
            this.script.execOnServer(ns, server);
        }
    }

    stopOnServer(ns: NS, server: string) {
        this.script.killOnServer(ns, server);
    }

    determineRunStatus(ns: NS): boolean {
        return this.script.isRunningOnAnyServers(ns);
    }

    getKillOnServers(ns: NS): string[] {
        return this.getRunOnServers(ns)
            .filter(server => this.script.isRunningOnServer(ns, server));
    }

    abstract getRunOnServers(ns: NS): string[];
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
export const ALL_HACK_SCRIPTS = [HACK, GROW, WEAKEN];

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

// Singularity Scripts
export const BUY_PROGRAMS = new Script("singularity/keepBuyingPrograms.js");


export abstract class StatusProperty implements HasStatus {
    name: string;
    output: string;
    constructor(name: string, output: string) {
        this.name = name;
        this.output = output;
    }

    abstract getValue(ns: NS): string;

    getStatus(ns: NS): [string, string] {
        return [this.output, this.getValue(ns)];
    }

    isMutable() : boolean {
        return false;
    }

    isUsable(ns: NS) : boolean {
        return true;
    }
}

export abstract class MutableStatusProperty extends StatusProperty {
    constructor(name: string, output: string) {
        super(name, output);
    }

    abstract setValue(ns: NS, value: string): void;

    abstract getDefaultValue(ns: NS) : string;

    initialize(ns: NS) {
        this.setValue(ns, this.getDefaultValue(ns));
    }

    afterSet(ns: NS) {}

    isMutable() : boolean {
        return true;
    }
}