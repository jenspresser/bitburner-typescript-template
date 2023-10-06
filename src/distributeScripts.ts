import { NS } from "@ns";
import { distributeScripts } from "library";

/** @param {NS} ns */
export async function main(ns: NS) {
    await distributeScripts(ns);
}