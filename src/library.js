import { NS } from "@ns";
import { printTable } from "/table";
import { getServersWithRootAccess } from "/libserver";

/**
 * @param {NS} ns
 * @returns {string}
 */
export function getNextHackTarget(ns) {
    let hackLevel = ns.getHackingLevel();

    if (hackLevel < 50) {
        return "n00dles";
    }
    return "foodnstuff";
}

/** 
 * @param {NS} ns
 * @return {Number}
 */
export function getHomeServerMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}

/** 
 * @param {NS} ns 
 * @param {String} hostname
*/
export async function uploadScripts(ns, hostname) {
    let scripts = ns.ls("home", ".js");

    await ns.scp(scripts, hostname);
}

/** 
 * @param {NS} ns
*/
export async function distributeScripts(ns) {
    let serverNames = getServersWithRootAccess(ns);

    for (var i = 0; i < serverNames.length; i++) {
        await uploadScripts(ns, serverNames[i]);
    }
}

/**
 * @param {NS} ns
 */
export function showHackData(ns) {
    let servers = getServerHackDataList(ns);
    let nextHackTarget = getNextHackTarget(ns);

    let matrix = servers.map(it => it.toArray(ns));

    ns.tprint("Next Hack Target: ", nextHackTarget);
    printTable(ns, matrix, ServerHackData.toHeaderArray(), "|");
}

/**
 * @param {NS} ns
 * @param {String} hostname
 * @returns {ServerData}
 */
export function getServerData(ns, hostname) {
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
    /**
     * @param {String} hostname
     * @param {Number} money
     * @param {Number} maxMoney
     * @param {Number} ram
     * @param {Number} maxRam
     * @param {Number} nextUpgradeCost
     */
    constructor(hostname, money, maxMoney, ram, maxRam, nextUpgradeCost) {
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
    toArray(ns) {
        let fmtUpgradeCost = ns.formatNumber(this.nextUpgradeCost);
        let fmtRam = ns.formatRam(this.ram);
        let fmtMaxRam = ns.formatRam(this.maxRam);
        return [this.hostname, fmtRam, fmtMaxRam, fmtUpgradeCost];
    }
}

/**
 * @param {String} hostname
 * @param {Number} ram
 * @param {Number} nextRam
 * @param {Number} upgradeRamCost
 */
export class ServerRam {
    constructor(hostname, ram) {
        this.hostname = hostname;
        this.ram = ram;
    }
}