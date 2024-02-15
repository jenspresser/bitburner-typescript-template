import { NS } from "@ns";
import { CORPORATION } from "/libscripts";
import { StatusAccess } from "/libstatus";

export async function main(ns: NS) {
    ns.tprint("### CALLBACK AFTER INSTALLING AUGMENTATIONS ###");

    let lastModules = StatusAccess.getStatus(ns).getRunningModules();

    let callbackArgs = ["start",...lastModules, "++tail"];

    ns.exec("/status.js", "home", 1, ...callbackArgs);
}