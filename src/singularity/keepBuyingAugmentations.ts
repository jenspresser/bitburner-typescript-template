import { NS } from "@ns";
import { getHomeServerMoney } from "/library";

export async function main(ns: NS) {
    while(true) {
        purchaseAvailableAugmentations(ns);

        await ns.sleep(5000);
    }
}

export function purchaseAvailableAugmentations(ns: NS) {
    let playerFactions = ns.getPlayer().factions;

    for(let faction of playerFactions) {
        let availableAugs = ns.singularity.getAugmentationsFromFaction(faction);
        let ownedAugs = ns.singularity.getOwnedAugmentations(true);
        let reputation = ns.singularity.getFactionRep(faction);
        
        for(let aug of availableAugs) {
            if(!ownedAugs.includes(aug)) {
                let price = ns.singularity.getAugmentationPrice(aug);
                let reputationRequired = ns.singularity.getAugmentationRepReq(aug);

                if(reputation > reputationRequired && getHomeServerMoney(ns) > price) {
                    ns.singularity.purchaseAugmentation(faction, aug);
                    ns.toast("Purchased Augmentation " + aug + " from " + faction);
                    ns.print("Purchased Augmentation " + aug + " from " + faction);
                } 
            }
        }
    }
}