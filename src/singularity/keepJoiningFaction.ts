import { NS } from "@ns";

export async function main(ns:NS) {
    while(true) {
        let factions = ns.singularity.checkFactionInvitations();

        for(let faction of factions) {
            if(ns.singularity.joinFaction(faction)) {
                ns.toast("Joined Faction " + faction);
            }
        }
        
        await ns.sleep(50);
    }
}