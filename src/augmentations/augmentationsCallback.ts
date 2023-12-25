import { NS } from "@ns";
import { CORPORATION } from "/libscripts";

export async function main(ns: NS) {
    ns.tprint("### CALLBACK AFTER INSTALLING AUGMENTATIONS ###");

    let callbackArgs = ["start","adv", "--hn", "++tail"];

    if(ns.getServerMaxRam("home") > (3* CORPORATION.ram(ns)) ) {
        // We have three times more RAM than needed for corpo script --> run with corpo
        callbackArgs.push("corp");
    }

    ns.exec("/status.js", "home", 1, ...callbackArgs);
}