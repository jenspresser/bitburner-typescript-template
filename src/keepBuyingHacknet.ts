import { NS } from "@ns";
import { keepBuyingHacknet } from "libhacknet";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint("Start buying Hacknet");
    await keepBuyingHacknet(ns);
}