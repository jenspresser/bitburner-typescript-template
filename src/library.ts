import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";

/**
 * @param {NS} ns
 * @returns {string}
 */
export function getNextHackTarget(ns: NS) {
    let hackLevel = ns.getHackingLevel();

    if (hackLevel < 50) {
        return "n00dles";
    }
    return "foodnstuff";
}

/** 
 * @param {NS} ns
 * @return {number}
 */
export function getHomeServerMoney(ns: NS) {
    return ns.getServerMoneyAvailable("home");
}

/** 
 * @param {NS} ns 
 * @param {string} hostname
*/
export function uploadScripts(ns: NS, hostname: string) {
    let scripts = ns.ls("home", ".js");

    ns.scp(scripts, hostname);
}

/** 
 * @param {NS} ns
*/
export function distributeScripts(ns: NS) {
    let serverNames = getServersWithRootAccess(ns);

    for (let i = 0; i < serverNames.length; i++) {
        uploadScripts(ns, serverNames[i]);
    }
}

/**
 * @param {NS} ns
 * @param {string} hostname
 * @returns {ServerData}
 */
export function getServerData(ns: NS, hostname: string): ServerData {
    let serverMoney = ns.getServerMoneyAvailable(hostname);
    let serverMaxMoney = ns.getServerMaxMoney(hostname);
    let serverRam = ns.getServerMaxRam(hostname);
    let serverMaxRam = ns.getPurchasedServerMaxRam();
    let upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, Math.min(serverRam * 2, serverMaxRam));

    return new ServerData(
        hostname,
        serverMoney,
        serverMaxMoney,
        serverRam,
        serverMaxRam,
        upgradeCost
    )
}

export class ServerData {
    hostname: string;
    money: number;
    maxMoney: number;
    ram: number;
    maxRam: number;
    nextUpgradeCost: number;
    /**
     * @param {string} hostname
     * @param {number} money
     * @param {number} maxMoney
     * @param {number} ram
     * @param {number} maxRam
     * @param {number} nextUpgradeCost
     */
    constructor(hostname: string, money: number, maxMoney: number, ram: number, maxRam: number, nextUpgradeCost: number) {
        this.hostname = hostname;
        this.money = money;
        this.maxMoney = maxMoney;
        this.ram = ram;
        this.maxRam = maxRam;
        this.nextUpgradeCost = nextUpgradeCost;
    }

    static toHeaderArray() {
        return ["Hostname", "Ram", "Max Ram", "upgrade cost"];
    }

    /** {NS} ns */
    toArray(ns: NS) {
        let fmtUpgradeCost = ns.formatNumber(this.nextUpgradeCost);
        let fmtRam = ns.formatRam(this.ram);
        let fmtMaxRam = ns.formatRam(this.maxRam);
        return [this.hostname, fmtRam, fmtMaxRam, fmtUpgradeCost];
    }
}

/**
 * @param {string} hostname
 * @param {number} ram
 */
export class ServerRam {
    hostname: string;
    ram: number;

    constructor(hostname: string, ram: number) {
        this.hostname = hostname;
        this.ram = ram;
    }
}