import { NS } from "@ns";
import {
    ServerRam,
    getServerData,
    getHomeServerMoney
} from "library";
import {
    getPurchasedServerNames,
    PURCHASE_SERVER_PREFIX
} from "libserver";

export const TARGET_PURCHASE_RAM = 16;

export const HACKNET_SCRIPTS = [
    "keepBuyingHacknet.js"
]

export const PURCHASE_SERVER_SCRIPTS = [
    "purchaseServers.js",
    "upgradeServers.js",
];

export const PURCHASE_SCRIPTS = PURCHASE_SERVER_SCRIPTS.concat(HACKNET_SCRIPTS);

/**
 * @param {NS} ns
 */
export function showPurchasedServers(ns) {
    let servers = getPurchasedServerNames(ns);

    for (var serverName of servers) {
        let server = getServerData(ns, serverName);

        ns.tprint(server.toString(ns));
    }
}

/** 
 * @param {NS} ns
*/
export async function upgradeServers(ns) {
    const targetMaxRam = ns.getPurchasedServerMaxRam();

    let initialCount = getPurchasedServerNames(ns).length;

    ns.tprint("Start upgrading Servers until " + ns.formatRam(targetMaxRam) + " RAM");
    ns.tprint("  initially " + initialCount + " purchased servers available");

    if (initialCount == 0) {
        ns.tprint("  Starting with 0 initial purchased Servers. Waiting until Servers available");

        while (getPurchasedServerNames(ns).length === 0) {
            await ns.sleep(10000);
        }

        ns.tprint("Purchased Servers available, start upgrading");
    }

    while (hasUpgradeableServer(ns, targetMaxRam)) {
        let server = getNextUpgradeableServer(ns, targetMaxRam);

        if (getHomeServerMoney(ns) > server.upgradeRamCost) {
            ns.upgradePurchasedServer(server.hostname, server.nextRam);
            // setupHackSimple(ns, server.hostname);
            // setuphackNext(ns, server.hostname);
        }

        await ns.sleep(50);
    }

    ns.tprint("Cannot upgrade more servers; EXIT");
}


/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {ServerRam}
 */
export function getNextUpgradeableServer(ns, targetMaxRam) {
    return getUpgradeableServers(ns, targetMaxRam)
        .sort((a, b) => a.upgradeRamCost - b.upgradeRamCost)
    [0];
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {Boolean}
 */
export function hasUpgradeableServer(ns, targetMaxRam) {
    return getUpgradeableServers(ns, targetMaxRam).length > 0;
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {PurchasedServerRam[]}
 */
export function getUpgradeableServers(ns, targetMaxRam) {
    return getPurchasedServerRams(ns, targetMaxRam)
        .filter(serverRam => serverRam.ram < targetMaxRam);
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {PurchasedServerRam[]}
 */
export function getPurchasedServerRams(ns, targetMaxRam) {
    return getPurchasedServerNames(ns)
        .filter(name => ns.getServerMaxRam(name) < targetMaxRam)
        .map(name => {
            let initialRam = ns.getServerMaxRam(name);
            let targetRam = initialRam * 2;
            return new PurchasedServerRam(name, initialRam, targetRam, ns.getPurchasedServerUpgradeCost(name, targetRam));
        });
}

export class PurchasedServerRam extends ServerRam {
    constructor(hostname, ram, nextRam, upgradeRamCost) {
        super(hostname, ram);
        this.nextRam = nextRam;
        this.upgradeRamCost = upgradeRamCost;
    }
}

/** 
 * @param {NS} ns
*/
export async function purchaseServers(ns) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    var purchaseRam = TARGET_PURCHASE_RAM;

    ns.tprint("Purchase Servers with " + ns.formatRam(purchaseRam) + " RAM");
    ns.tprint(" Starting with " + getPurchasedServerNames(ns).length + " purchased servers");

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (getPurchasedServerNames(ns).length < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (getHomeServerMoney(ns) > ns.getPurchasedServerCost(purchaseRam)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            var hostname = ns.purchaseServer(getNextPurchaseServerName(ns), purchaseRam);
            //setupHackSimple(ns, hostname);
            //setuphackNext(ns, hostname);
        }

        await ns.sleep(50);
    }

    ns.tprint("Cannot purchase more servers; EXIT");
}


/**
 * @param {NS} ns
 * @returns {String}
 */
export function getNextPurchaseServerName(ns) {
    let pservers = getPurchasedServerNames(ns);

    // Since the length value is one greater than the highest index (due to 0-based array)
    // it should also be the next pserv-index
    return PURCHASE_SERVER_PREFIX + pservers.length;
}