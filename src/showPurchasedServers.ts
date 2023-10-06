import { NS } from "@ns";
import { getServerData, ServerData } from "library";
import { getPurchasedServerNames } from "libserver";
import { TARGET_PURCHASE_RAM } from "libpurchase";
import { printTable } from "table";

/** @param {NS} ns */
export async function main(ns: NS) {
    let pserverCost = ns.formatNumber(ns.getPurchasedServerCost(TARGET_PURCHASE_RAM));

    printTable(ns, [["Next Server Cost"], [pserverCost]], [], "first", "right");

    /** @type {ServerData[]} */
    let servers = getPurchasedServerNames(ns)
        .map(serverName => getServerData(ns, serverName));

    let matrix = servers.map(it => it.toArray(ns));

    printTable(ns, matrix, ServerData.toHeaderArray(), "");
}