import { NS } from "@ns";

export async function main(ns: NS) {
    ns.tprint("### CALLBACK AFTER INSTALLING AUGMENTATIONS ###");
    ns.exec("/status.js", "home", 1, "start", "adv", "--hn");
}