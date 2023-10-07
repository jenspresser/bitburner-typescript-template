import { NS } from "@ns";
import { getNodeServerNames } from "./libserver";
import { getProgramCount } from "./hack/libhack";
import { printTable } from "./table";

const SERVER_NAMES = [
    "CSEC",
    "avmnite-02h",
    "I.I.I.I",
    "run4theh111z",
    "The-Cave",
    "w0r1d_d43m0n"
];

/** @param {NS} ns */
export async function main(ns: NS) {
    let playerInfo = getPlayerInfo(ns);
    let infos = getInfos(ns, playerInfo);

    let playerHeader = ["Hacking Level", "Program Count"];
    let playerMatrix = [[
        playerInfo.hackingLevel, 
        playerInfo.programCount
    ]];

    let serverHeader = ["Server","Ports Req", "Ports left", "Hack Lvl Req", "Level left", "can backdoor?"];
    let serverMatrix : any[][] = infos.map(it => [
        it.hostname, 
        it.requiredPorts, 
        Math.max(0, it.requiredPorts - playerInfo.programCount),
        it.requiredHackLevel, 
        Math.max(0, it.requiredHackLevel - playerInfo.hackingLevel),
        it.canBackdoor
    ]);

    printTable(ns, playerMatrix, {header: playerHeader});
    printTable(ns, serverMatrix, {header: serverHeader});
}

function getInfos(ns: NS, playerInfo : PlayerInfo) : Info[] {
    return SERVER_NAMES.map(server => {
        let portsRequired = ns.getServerNumPortsRequired(server);
        let levelRequired = ns.getServerRequiredHackingLevel(server);

        let enoughPorts = playerInfo.programCount >= portsRequired;
        let hackingLevelMet = playerInfo.hackingLevel >= levelRequired;
        let canBackdoor = enoughPorts && hackingLevelMet;

        return {
            hostname: server,
            requiredPorts: portsRequired,
            requiredHackLevel: levelRequired,
            canBackdoor: canBackdoor
        }
    });
}

function getPlayerInfo(ns: NS) : PlayerInfo {
    return {
        programCount: getProgramCount(ns),
        hackingLevel: ns.getHackingLevel()
    }
}

type PlayerInfo = {
    programCount: number,
    hackingLevel: number
};

type Info = {
    hostname: string,
    requiredPorts: number,
    requiredHackLevel: number,
    canBackdoor: boolean
};