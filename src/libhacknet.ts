import { Hacknet, NS } from "@ns";
import { getHomeServerMoney } from "library";
import { MODE_FILE_NAME } from "./hack/libhack";

export const HACKNET_MODE_FILENAME = "_hacknet_mode.txt";
export const HACKNET_DEFAULT_MODE : HacknetModes = {
    purchase: true,
    hash_to_money: true
} ;

export type HacknetModes = {
    purchase: boolean,
    hash_to_money: boolean
}
export type HacknetMode = keyof HacknetModes;

const MAX_HACKNET_NODES = 30;

export async function keepHandlingHacknet(ns: NS) {
    let hacknet = ns.hacknet;

    ns.print("Start keepHandlingHacknet");

    while(true) {
        let modes = readHacknetModes(ns);

        if( modes.purchase && canKeepUpgradingHacknet(hacknet) ) {
            keepBuyingHacknet(ns, hacknet);
        }
        if( modes.hash_to_money ) {
            spendHashesForMoney(ns, hacknet);
        }

        await ns.sleep(1000);
    }
}

function spendHashesForMoney(ns: NS, hacknet: Hacknet) {
    const CASH_HASH_UPGRADE = "Sell for Money";
    if(hacknet.numHashes() > hacknet.hashCost(CASH_HASH_UPGRADE)) {
        hacknet.spendHashes(CASH_HASH_UPGRADE);
    }
}

function keepBuyingHacknet(ns: NS, hacknet: Hacknet) {
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

export function setHacknetModes(ns: NS, modes: HacknetModes) {
    let modeJson = JSON.stringify(modes);
    ns.write(MODE_FILE_NAME, modeJson, "w");
}

export function getHacknetModes(ns: NS) : HacknetModes {
    if(!ns.fileExists(HACKNET_MODE_FILENAME)) {
        setHacknetModes(ns, HACKNET_DEFAULT_MODE);    
    }

    return readHacknetModes(ns);
}

export function readHacknetModes(ns: NS) : HacknetModes {
    let modeJson = ns.read(MODE_FILE_NAME);
    let modes : HacknetModes = JSON.parse(modeJson);

    return modes;
}

export function readHacknetModeStatus(ns: NS, modeName: HacknetMode) : boolean {
    return readHacknetModes(ns)[modeName];
}

export function writeHacknetModeStatus(ns: NS, modeName: HacknetMode, newStatus: boolean) {
    let modes = readHacknetModes(ns);

    modes[modeName] = newStatus;

    setHacknetModes(ns, modes);
}

