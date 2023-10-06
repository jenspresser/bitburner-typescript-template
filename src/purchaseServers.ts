import { NS } from "@ns";
import { purchaseServers } from "libpurchase";

/** @param {NS} ns */
export async function main(ns: NS) {
    await purchaseServers(ns);
}