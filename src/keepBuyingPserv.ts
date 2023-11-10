import { NS } from "@ns";
import { keepBuyingPserv } from "./libpurchase";


/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint("Start buying Pserv");
    await keepBuyingPserv(ns);
}