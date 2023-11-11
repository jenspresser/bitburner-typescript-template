import { NS } from "@ns";
import { ServerRam, getHomeServerMoney } from "library";
import {
    getPurchasedServerNames,
    PURCHASE_SERVER_PREFIX
} from "libserver";

export const TARGET_PURCHASE_RAM = 16;

export async function keepBuyingPserv(ns: NS) {
    ns.tprint("Start keepBuyingPserv!");

    const initialCount = getPurchasedServerNames(ns).length;
    const allServersBoughtMsg = "  Already have all " + ns.getPurchasedServerLimit() + " purchased servers, will not buy more";

    ns.tprint("Purchase Servers with " + ns.formatRam(TARGET_PURCHASE_RAM) + " RAM");
    ns.tprint(" Starting with " + initialCount + " purchased servers");
    ns.tprint("Start upgrading Servers until " + ns.formatRam(ns.getPurchasedServerMaxRam()) + " RAM");
    ns.tprint("  initially " + initialCount + " purchased servers available");

    if (getPurchasedServerNames(ns).length >= ns.getPurchasedServerLimit()) {
        ns.tprint(allServersBoughtMsg);
    }

    while (canKeepUpgradingPserv(ns)) {
        // Check, if we do not have reached the max server limit
        if (getPurchasedServerNames(ns).length < ns.getPurchasedServerLimit()) {
            // Check if we have enough money to purchase a server
            if (getHomeServerMoney(ns) > ns.getPurchasedServerCost(TARGET_PURCHASE_RAM)) {
                const nextServerName = getNextPurchaseServerName(ns);
                ns.purchaseServer(nextServerName, TARGET_PURCHASE_RAM);

                

                // Ausgeben, wenn der letzte Server gekauft wurde
                if (getPurchasedServerNames(ns).length >= ns.getPurchasedServerLimit()) {
                    ns.tprint(allServersBoughtMsg);
                }
            }
        }

        if (hasUpgradeableServer(ns)) {
            let server = getNextUpgradeableServer(ns);
    
            if (getHomeServerMoney(ns) > server.upgradeRamCost) {
                ns.upgradePurchasedServer(server.hostname, server.nextRam);

                ns.toast("Upgraded Pserv " + server.hostname + " to " + ns.formatRam(server.nextRam));
            }
        }
        
        await ns.sleep(50);
    }

    ns.tprint("Cannot buy or upgrade any more Pserv, EXIT");
}

function canKeepUpgradingPserv(ns: NS) {
    return canBuyNewServer(ns) || hasUpgradeableServer(ns);
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {PurchasedServerRam}
 */
export function getNextUpgradeableServer(ns: NS): PurchasedServerRam {
    return getUpgradeableServers(ns)
        .sort((a, b) => a.upgradeRamCost - b.upgradeRamCost)
    [0];
}

export function canBuyNewServer(ns: NS): boolean {
    return getPurchasedServerNames(ns).length < ns.getPurchasedServerLimit();
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {Boolean}
 */
export function hasUpgradeableServer(ns: NS): boolean {
    let targetMaxRam: number = ns.getPurchasedServerMaxRam();
    return getUpgradeableServers(ns).length > 0;
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {PurchasedServerRam[]}
 */
export function getUpgradeableServers(ns: NS): PurchasedServerRam[] {
    return getPurchasedServerRams(ns)
        .filter(serverRam => serverRam.ram < ns.getPurchasedServerMaxRam());
}

/**
 * @param {NS} ns
 * @param {Number} targetMaxRam
 * @returns {PurchasedServerRam[]}
 */
export function getPurchasedServerRams(ns: NS,): PurchasedServerRam[] {
    return getPurchasedServerNames(ns)
        .filter(name => ns.getServerMaxRam(name) < ns.getPurchasedServerMaxRam())
        .map(name => {
            let initialRam = ns.getServerMaxRam(name);
            let targetRam = initialRam * 2;
            return new PurchasedServerRam(name, initialRam, targetRam, ns.getPurchasedServerUpgradeCost(name, targetRam));
        });
}

export class PurchasedServerRam extends ServerRam {
    upgradeRamCost: number;
    nextRam: number;
    constructor(hostname: string, ram: number, nextRam: number, upgradeRamCost: number) {
        super(hostname, ram);
        this.nextRam = nextRam;
        this.upgradeRamCost = upgradeRamCost;
    }
}

/**
 * @param {NS} ns
 * @returns {String}
 */
export function getNextPurchaseServerName(ns: NS): string {
    let pservers = getPurchasedServerNames(ns);

    // Since the length value is one greater than the highest index (due to 0-based array)
    // it should also be the next pserv-index
    return PURCHASE_SERVER_PREFIX + pservers.length;
}