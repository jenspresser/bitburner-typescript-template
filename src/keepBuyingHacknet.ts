import { NS } from "@ns";
import { keepBuyingHacknet } from "libhacknet";

/** @param {NS} ns */
export async function main(ns: NS) {
    await keepBuyingHacknet(ns);
}