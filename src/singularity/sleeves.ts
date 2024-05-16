import { NS } from "@ns";
import { getHomeServerMoney } from "/library";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    
    while(true) {
        ns.clearLog();
        
        purchaseSleeveAugmentations(ns);

        await ns.sleep(2000);
    }
}

function purchaseSleeveAugmentations(ns: NS) {
    const sleeveApi = ns.sleeve;

    const numSleeves = sleeveApi.getNumSleeves();

    for (let sleeveIndex = 0; sleeveIndex < numSleeves; sleeveIndex++) {
        let sleeve = sleeveApi.getSleeve(sleeveIndex);

        if(sleeve.shock > 0) {
            ns.print("Sleeve " + sleeveIndex + ": set sleeve to shock recovery");
            sleeveApi.setToShockRecovery(sleeveIndex);
        } else if (sleeve.sync < 100) {
            ns.print("Sleeve " + sleeveIndex + ": set sleeve to synchronize");
            sleeveApi.setToSynchronize(sleeveIndex);
        } else {
            let sleevePurchasableAugs = sleeveApi.getSleevePurchasableAugs(sleeveIndex).filter(aug => getHomeServerMoney(ns) > aug.cost);

            if(sleevePurchasableAugs.length > 0) {
                let aug = sleevePurchasableAugs[0];

                if(getHomeServerMoney(ns) > aug.cost) {
                    if(sleeveApi.purchaseSleeveAug(sleeveIndex, aug.name)) {
                        ns.print("Sleeve " + sleeveIndex + ": bought augmentation " + aug.name);
                    }
                }
            }
        }

    }
}
