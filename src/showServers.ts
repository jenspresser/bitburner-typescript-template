import { NS } from "@ns";
import { getServerInfo, ServerInfo } from "libserver";
import { printTable } from "table";

/** @param {NS} ns */
export async function main(ns: NS) {
    let servers: ServerInfo[] = getServerInfo(ns);

    if (ns.args[0] === "help") {
        ns.tprint("usage:");
        ns.tprint("  run showServers.js");
        ns.tprint("  showServers");
        ns.tprint("");
        ns.tprint("Filters: root, pserv, nodes, ram8, ram16, ram32, ram64, ram128");
        ns.tprint("Sorting: byroot, byram, byname");
        return;
    }

    for (let arg of ns.args) {
        if (arg === "root") {
            servers = servers.filter(it => it.hasRoot);
        }
        if (arg === "pserv") {
            servers = servers.filter(it => it.isPurchasedServer());
        }
        if (arg === "nodes") {
            servers = servers.filter(it => it.isNodeServer());
        }
        if (arg === "ram8") {
            servers = servers.filter(it => it.maxRam >= 8);
        }
        if (arg === "ram16") {
            servers = servers.filter(it => it.maxRam >= 16);
        }
        if (arg === "ram32") {
            servers = servers.filter(it => it.maxRam >= 32);
        }
        if (arg === "ram64") {
            servers = servers.filter(it => it.maxRam >= 64);
        }
        if (arg === "ram128") {
            servers = servers.filter(it => it.maxRam >= 128);
        }
    }
    for (let arg of ns.args) {
        if (arg === "byroot") {
            servers.sort((a, b) => {
                let rootA = a.hasRoot ? 1 : 0;
                let rootB = b.hasRoot ? 1 : 0;
                return rootB - rootA;
            });
        }
        if (arg === "byram") {
            servers.sort(ServerInfo.sortByRamDesc());
        }
        if (arg === "byname") {
            servers.sort((a, b) => a.hostname.localeCompare(b.hostname));
        }
    }

    let matrix : any[][] = servers.map(it => it.toArray(ns));

    printTable(ns, matrix, {header: ServerInfo.toHeaderArray()});
}