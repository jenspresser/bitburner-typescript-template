import { NS } from "@ns";
import { purchaseServers } from "libpurchase";

/** @param {NS} ns */
export async function main(ns) {
    await purchaseServers(ns);
}