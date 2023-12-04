import { NS } from "@ns";
import { getHomeServerMoney } from "/library";

const NEUROFLUX_GOVERNOR = "NeuroFlux Governor";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    
    while(true) {
        ns.clearLog();
        
        purchaseAvailableAugmentations(ns);

        await ns.sleep(2000);
    }
}

export function purchaseAvailableAugmentations(ns: NS) {
    let playerFactions = ns.getPlayer().factions;

    ns.print("** Player factions: " + playerFactions);

    for(let faction of playerFactions) {
        ns.print("** Check for faction " + faction);

        for(let aug of ns.singularity.getAugmentationsFromFaction(faction)) {
            if(!ns.singularity.getOwnedAugmentations(true).includes(aug)) {
                ns.print("Available from " + faction + ": " + aug);

                let price = ns.singularity.getAugmentationPrice(aug);
                let reputationRequired = ns.singularity.getAugmentationRepReq(aug);
                let prerequisiteAugs = ns.singularity.getAugmentationPrereq(aug);

                let prerequisiteAugsValid = prerequisiteAugs.length === 0 || prerequisiteAugs.every((it) => ns.singularity.getOwnedAugmentations(true).includes(it));

                if(prerequisiteAugsValid && ns.singularity.getFactionRep(faction) > reputationRequired && getHomeServerMoney(ns) > price) {
                    if(ns.singularity.purchaseAugmentation(faction, aug)) {
                        ns.toast("Purchased Augmentation " + aug + " from " + faction);
                        ns.print("Purchased Augmentation " + aug + " from " + faction);
                    }
                } 
            }
        }

        for(let i = 1; i<= 100; i++) {
            if(ns.singularity.getAugmentationBasePrice(NEUROFLUX_GOVERNOR) <= getHomeServerMoney(ns)) {
                if(ns.singularity.purchaseAugmentation(faction, NEUROFLUX_GOVERNOR)) {
                    ns.toast("Purchased Augmentation " + NEUROFLUX_GOVERNOR + " from " + faction);
                    ns.print("Purchased Augmentation " + NEUROFLUX_GOVERNOR + " from " + faction);
                }
            }
        }
    }
}