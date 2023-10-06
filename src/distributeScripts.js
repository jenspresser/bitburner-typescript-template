import { NS } from "@ns";
import { distributeScripts } from "library";

/** @param {NS} ns */
export async function main(ns) {
    await distributeScripts(ns);
}