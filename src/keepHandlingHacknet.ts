import { NS } from "@ns";
import { keepHandlingHacknet } from "libhacknet";

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint("Start buying Hacknet");
    await keepHandlingHacknet(ns);
}