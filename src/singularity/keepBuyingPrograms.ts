import { NS } from "@ns";
import { getMissingPrograms } from "/libprograms";
import { getHomeServerMoney } from "/library";

const TOR_COST = 200000;

export async function main(ns: NS) {
    while (canKeepBuying(ns)) {
        if (!ns.hasTorRouter()) {
            if (getHomeServerMoney(ns) > TOR_COST) {
                ns.singularity.purchaseTor();

                ns.toast("Purchased TOR Access");
            }
        } else {
            let missingPrograms = getMissingPrograms(ns);

            for(let program of missingPrograms) {
                let programCost = ns.singularity.getDarkwebProgramCost(program);

                if(getHomeServerMoney(ns) > programCost) {
                    ns.singularity.purchaseProgram(program);

                    ns.toast("Purchased Program " + program);
                }
            }
        }

        await ns.sleep(5000);
    }
}

function canKeepBuying(ns: NS) {
    return !ns.hasTorRouter() || getMissingPrograms(ns).length > 0;
}