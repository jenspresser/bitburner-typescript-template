import { upgradeServers } from "libpurchase";
import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns) {
    await upgradeServers(ns);
}