import { NS } from "@ns";
import { printTable } from "./table";
import { BackdoorInfo, getBackdoorInfosForServers, getPlayerInfo, listServersWithoutBackdoorInstalled } from "./libbackdoor";
import { FACTION_SERVERS, getNodeServerNames } from "./libserver";

/** @param {NS} ns */
export async function main(ns: NS) {
    let playerInfo = getPlayerInfo(ns);
    let infos = getBackdoorInfosForServers(ns, getNodeServerNames(ns));

    infos = filterInfos(ns, infos);

    let playerHeader = ["Hacking Level", "Program Count"];
    let playerMatrix = [[
        playerInfo.hackingLevel, 
        playerInfo.programCount
    ]];

    let serverHeader = ["Server","Ports Req", "Ports left", "Hack Lvl Req", "Level left", "has backdoor", "can backdoor?"];
    let serverMatrix : any[][] = infos.map(it => [
        it.hostname, 
        it.requiredPorts, 
        Math.max(0, it.requiredPorts - playerInfo.programCount),
        it.requiredHackLevel, 
        Math.max(0, it.requiredHackLevel - playerInfo.hackingLevel),
        it.backdoorInstalled,
        it.canBackdoor
    ]);

    printTable(ns, playerMatrix, {header: playerHeader});
    printTable(ns, serverMatrix, {header: serverHeader});
}

function filterInfos(ns: NS, infos: BackdoorInfo[]) : BackdoorInfo[] {
    if(ns.args.includes("faction")) {
        return infos.filter(it => FACTION_SERVERS.includes(it.hostname));
    }

    let result = infos;

    if(ns.args.includes("pending")) {
        result = result.filter(it => !it.backdoorInstalled);
    }
    if(ns.args.includes("canBackdoor")) {
        result = result.filter(it => it.canBackdoor && !it.backdoorInstalled);
    }

    return result;
}