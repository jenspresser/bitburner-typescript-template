import { Hacknet, NS } from "@ns";
import { getHomeServerMoney } from "library";
import { isFeatureActive } from "./libproperties";
import { StatusAccess } from "./libstatus";

export async function keepBuyingHacknet(ns: NS) {
    let hacknet = ns.hacknet;

    ns.print("Start keepBuyingHacknet");

    while (canKeepUpgradingHacknet(ns, hacknet)) {
        ns.print("  canKeepUpgradingHacknet ");

        if (isFeatureActive(ns, "hacknet_purchase")) {
            if (canBuyHacknetNode(ns, hacknet)) {
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
        }

        if(isFeatureActive(ns, "hacknet_money")) {
            buyHashUpgrade(hacknet, "Sell for Money")
        }

        if(isFeatureActive(ns, "hacknet_corpo")) {
            buyHashUpgrade(hacknet, "Sell for Corporation Funds");
        }

        if(isFeatureActive(ns, "hacknet_research")) {
            buyHashUpgrade(hacknet, "Exchange for Corporation Research");
        }


        await ns.sleep(10);
    } 
    
    printOnStop(ns);
}

function printOnStop(ns :NS) {
    ns.tprint("Cannot keep upgrading hacknet: Max Server count and fully upgraded");
}

type UpgradeName = "Sell for Money" | "Sell for Corporation Funds" | "Exchange for Corporation Research";
function buyHashUpgrade(hacknet: Hacknet, upgradeName: UpgradeName) {
    if(hacknet.numHashes() > hacknet.hashCost(upgradeName)) {
        hacknet.spendHashes(upgradeName);
    }
}

export function canKeepUpgradingHacknet(ns: NS, hacknet: Hacknet) {
    if (canBuyHacknetNode(ns, hacknet)) {
        return true;
    }

    if (canUpgradeAnyHacknetNode(ns, hacknet)) {
        return true;
    }

    return false;
}

export function canBuyHacknetNode(ns: NS, hacknet: Hacknet) {
    const maxHacknetServers = StatusAccess.getStatus(ns).getNumberProperty("hacknet_max_servers");

    if (hacknet.numNodes() < maxHacknetServers) {
        return true;
    }

    return false;
}

export function canUpgradeAnyHacknetNode(ns: NS, hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(ns, hacknet, index)) {
            return true;
        }
    }

    return false;
}

export function getUpgradeableHacknetNode(ns: NS, hacknet: Hacknet) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNode(ns, hacknet, index)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeLevel(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeLevel(ns, hacknet, index) && hacknet.getLevelUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeRam(hacknet: Hacknet, ns: NS) {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeRam(ns, hacknet, index) && hacknet.getRamUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetNodeCore(hacknet: Hacknet, ns: NS) : number  {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetNodeCore(ns, hacknet, index) && hacknet.getCoreUpgradeCost(index) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;
}

export function getUpgradeableHacknetServerCache(hacknet: Hacknet, ns: NS) : number {
    for (let index = 0; index < hacknet.numNodes(); index++) {
        if (canUpgradeHacknetServerCache(ns, hacknet, index) && hacknet.getCacheUpgradeCost(index, 1) < getHomeServerMoney(ns)) {
            return index;
        }
    }

    return -1;

}

export function canUpgradeHacknetNode(ns: NS, hacknet: Hacknet, index: number) {
    if (canUpgradeHacknetNodeLevel(ns, hacknet, index)) {
        return true;
    }
    if (canUpgradeHacknetNodeRam(ns, hacknet, index)) {
        return true;
    }
    if (canUpgradeHacknetNodeCore(ns, hacknet, index)) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetNodeLevel(ns: NS, hacknet: Hacknet, index: number) {
    const currentLevel = hacknet.getNodeStats(index).level;
    const maxLevel = StatusAccess.getStatus(ns).getNumberProperty("hacknet_max_level");

    if(currentLevel >= maxLevel)     {
        return false;
    }

    if (hacknet.getLevelUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetNodeCore(ns: NS, hacknet: Hacknet, index: number) {
    const currentCores = hacknet.getNodeStats(index).cores;
    const maxCores = StatusAccess.getStatus(ns).getNumberProperty("hacknet_max_cores");

    if(currentCores >= maxCores) {
        return false;
    }

    if (hacknet.getCoreUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetServerCache(ns: NS, hacknet: Hacknet, index: number) {
    if (hacknet.getCacheUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}

export function canUpgradeHacknetNodeRam(ns: NS, hacknet: Hacknet, index: number) {
    if (hacknet.getRamUpgradeCost(index) < Infinity) {
        return true;
    }

    return false;
}