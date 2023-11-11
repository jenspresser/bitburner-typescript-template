import { NS } from "@ns";
import { HOME_COMPUTER_MAX_CORES, HOME_COMPUTER_MAX_RAM, getHomeMaxRam } from "/libram";
import { getHomeServerMoney } from "/library";

export async function main(ns: NS) {
    while(canUpgradeHome(ns)) {
        if(canUpgradeHomeRam(ns)) {
            let ramCost = ns.singularity.getUpgradeHomeRamCost();

            if(getHomeServerMoney(ns) > ramCost) {
                ns.singularity.upgradeHomeRam();
            }
        }

        if(canUpgradeHomeCores(ns)) {
            let coresCost = ns.singularity.getUpgradeHomeCoresCost();

            if(getHomeServerMoney(ns) > coresCost) {
                ns.singularity.upgradeHomeCores();
            }
        }

        await ns.sleep(10000);
    }
}

function canUpgradeHome(ns: NS) {
    return canUpgradeHomeRam(ns) || canUpgradeHomeCores(ns);
}

function canUpgradeHomeRam(ns: NS) {
    return getHomeMaxRam(ns) < HOME_COMPUTER_MAX_RAM;
}

function canUpgradeHomeCores(ns: NS) {
    return ns.getServer("home").cpuCores < HOME_COMPUTER_MAX_CORES;
}