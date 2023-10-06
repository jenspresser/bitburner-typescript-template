import { NS } from "@ns";
import { keepAutoDistributing } from "/hack/libhack";

/** @param {NS} ns */
export async function main(ns) {
    await keepAutoDistributing(ns);
}