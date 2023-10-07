import { Hacknet, NS } from "@ns";
import { getHomeServerMoney } from "library";

const MAX_HACKNET_NODES = 30;

/** 
 * @param {NS} ns
 */
export async function keepBuyingHacknet(ns: NS) {
    let hacknet = ns.hacknet;

    ns.print("Start keepBuyingHacknet");

    while (canKeepUpgradingHacknet(hacknet)) {
        ns.print("  canKeepUpgradingHacknet ");

        if (canBuyHacknetNode(hacknet)) {
            if (hacknet.getPurchaseNodeCost() < getHomeServerMoney(ns)) {
                ns.print("    can buy node and afford it");
                hacknet.purchaseNode();
            }
        }

        let upgradeableNodeLevel = getUpgradeableHacknetNodeLevel(hacknet, ns);
        ns.print("  next upgradeable Level hacknet node: " + upgradeableNodeLevel)

        if (upgradeableNodeLevel > -1) {
            ns.print("    can upgrade node level and affort it");
            hacknet.upgradeLevel(upgradeableNodeLevel);
        }

        let upgradeableNodeRam = getUpgradeableHacknetNodeRam(hacknet, ns);
        ns.print("  next upgradeable RAM hacknet node: " + upgradeableNodeRam)

        if (upgradeableNodeRam > -1) {
            ns.print("       can upgrade node RAM and affort it");
            hacknet.upgradeRam(upgradeableNodeRam);
        }

        let upgradeableNodeCore = getUpgradeableHacknetNodeCore(hacknet, ns);
        ns.print("  next upgradeable Core hacknet node: " + upgradeableNodeCore)

        if (upgradeableNodeCore > -1) {
            ns.print("       can upgrade node core and affort it");
            hacknet.upgradeCore(upgradeableNodeCore);
        }
        await ns.sleep(10);
    }
    ns.print("End keepBuyingHacknet");
}

/** 
 * @param {Hacknet} hacknet
 * @return {Boolean}
 */
export function canKeepUpgradingHacknet(hacknet: Hacknet) {
    if (canBuyHacknetNode(hacknet)) {
        return true;
    }

    if (canUpgradeAnyHacknetNode(hacknet)) {
        return true;
    }

    return false;
}

/** 
 * @param {Hacknet} hacknet
 * @return {Boolean}
 */
export function canBuyHacknetNode(hacknet: Hacknet) {
    //
    if (hacknet.numNodes() < MAX_HACKNET_NODES) {
        return true;
    }

    return false;
}


/** 
 * @param {Hacknet} hacknet
 * @return {Boolean}
 */
export function canUpgradeAnyHacknetNode(hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(hacknet, index)) {
            return true;
        }
    }

    return false;
}

/** 
 * @param {Hacknet} hacknet
 * @return {Number}
 */
export function getUpgradeableHacknetNode(hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(hacknet, index)) {
            return index;
        }
    }

    return -1;
}


/** 
 * @param {Hacknet} hacknet
 * @param {NS} ns
 * @return {Number}
 */
export function getUpgradeableHacknetNodeLevel(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeLevel(hacknet, index) && hacknet.getLevelUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}
/** 
 * @param {Hacknet} hacknet
 * @param {NS} ns
 * @return {Number}
 */
export function getUpgradeableHacknetNodeRam(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeRam(hacknet, index) && hacknet.getRamUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}
/** 
 * @param {Hacknet} hacknet
 * @param {NS} ns
 * @return {Number}
 */
export function getUpgradeableHacknetNodeCore(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeCore(hacknet, index) && hacknet.getCoreUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

/** 
 * @param {Hacknet} hacknet
 * @param {Number} index
 * @return {Boolean}
 */
export function canUpgradeHacknetNode(hacknet: Hacknet, index: number) {
    if (canUpgradeHacknetNodeLevel(hacknet, index)) {
        return true;
    }
    if (canUpgradeHacknetNodeRam(hacknet, index)) {
        return true;
    }
    if (canUpgradeHacknetNodeCore(hacknet, index)) {
        return true;
    }

    return false;
}

/** 
 * @param {Hacknet} hacknet
 * @param {Number} index
 * @return {Boolean}
 */
export function canUpgradeHacknetNodeLevel(hacknet: Hacknet, index: number) {
    if (hacknet.getLevelUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

/** 
 * @param {Hacknet} hacknet
 * @param {Number} index
 * @return {Boolean}
 */
export function canUpgradeHacknetNodeCore(hacknet: Hacknet, index: number) {
    if (hacknet.getCoreUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

/** 
 * @param {Hacknet} hacknet
 * @param {Number} index
 * @return {Boolean}
 */
export function canUpgradeHacknetNodeRam(hacknet: Hacknet, index: number) {
    if (hacknet.getRamUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}