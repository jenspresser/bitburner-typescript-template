import { Hacknet, NS } from "@ns";
import { getHomeServerMoney } from "library";

const MAX_HACKNET_NODES = 30;

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
        ns.print("  next upgradeable Level hacknet node: " + upgradeableNodeLevel);

        if (upgradeableNodeLevel > -1) {
            ns.print("    can upgrade node level and affort it");
            hacknet.upgradeLevel(upgradeableNodeLevel);
        }

        let upgradeableNodeRam = getUpgradeableHacknetNodeRam(hacknet, ns);
        ns.print("  next upgradeable RAM hacknet node: " + upgradeableNodeRam);

        if (upgradeableNodeRam > -1) {
            ns.print("       can upgrade node RAM and affort it");
            hacknet.upgradeRam(upgradeableNodeRam);
        }

        let upgradeableNodeCore = getUpgradeableHacknetNodeCore(hacknet, ns);
        ns.print("  next upgradeable Core hacknet node: " + upgradeableNodeCore);

        if (upgradeableNodeCore > -1) {
            ns.print("       can upgrade node core and affort it");
            hacknet.upgradeCore(upgradeableNodeCore);
        }

        let upgradeableServerCache = getUpgradeableHacknetServerCache(hacknet, ns);
        ns.print("  next upgradeable Cache hacknet node: " + upgradeableServerCache);

        if(upgradeableServerCache > -1) {
            ns.print("       can upgrade server cache and afford it");
            hacknet.upgradeCache(upgradeableServerCache, 1);
        }

        hashesToMoney(hacknet);

        await ns.sleep(10);
    } 
    
    printOnStop(ns);
}

function printOnStop(ns :NS) {
    ns.tprint("Cannot keep upgrading hacknet: Max Server count and fully upgraded");
}

export function hashesToMoney(hacknet: Hacknet) {
    const upgradeName = "Sell for Money";
    if(hacknet.numHashes() > hacknet.hashCost(upgradeName)) {
        hacknet.spendHashes(upgradeName);
    }
}

export function canKeepUpgradingHacknet(hacknet: Hacknet) {
    if (canBuyHacknetNode(hacknet)) {
        return true;
    }

    if (canUpgradeAnyHacknetNode(hacknet)) {
        return true;
    }

    return false;
}

export function canBuyHacknetNode(hacknet: Hacknet) {
    //
    if (hacknet.numNodes() < MAX_HACKNET_NODES) {
        return true;
    }

    return false;
}

export function canUpgradeAnyHacknetNode(hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(hacknet, index)) {
            return true;
        }
    }

    return false;
}

export function getUpgradeableHacknetNode(hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(hacknet, index)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeLevel(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeLevel(hacknet, index) && hacknet.getLevelUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeRam(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeRam(hacknet, index) && hacknet.getRamUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeCore(hacknet: Hacknet, ns: NS) : number  {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeCore(hacknet, index) && hacknet.getCoreUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetServerCache(hacknet: Hacknet, ns: NS) : number {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetServerCache(hacknet, index) && hacknet.getCacheUpgradeCost(index, 1) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;

}

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


export function canUpgradeHacknetNodeLevel(hacknet: Hacknet, index: number) {
    if (hacknet.getLevelUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}


export function canUpgradeHacknetNodeCore(hacknet: Hacknet, index: number) {
    if (hacknet.getCoreUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetServerCache(hacknet: Hacknet, index: number) {
    if (hacknet.getCacheUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetNodeRam(hacknet: Hacknet, index: number) {
    if (hacknet.getRamUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}