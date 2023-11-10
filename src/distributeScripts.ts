import { NS } from "@ns";
import { distributeScripts } from "./libserver";

/** @param {NS} ns */
export async function main(ns: NS) {
    await distributeScripts(ns);
}