import { NS } from "@ns";
import { getProgramCount } from "./libprograms";
import { getNodeServerNames } from "./libserver";

export function getBackdoorInfos(ns: NS) {
    return getBackdoorInfosForServers(ns, listServersWithoutBackdoorInstalled(ns));
}

export function getBackdoorInfosForServers(ns: NS, serverList: string[]) : BackdoorInfo[] {
    let playerInfo = getPlayerInfo(ns);

    return serverList.map(server => {
        let portsRequired = ns.getServerNumPortsRequired(server);
        let levelRequired = ns.getServerRequiredHackingLevel(server);
        let backdoorInstalled = ns.getServer(server)?.backdoorInstalled ?? false;

        let enoughPorts = playerInfo.programCount >= portsRequired;
        let hackingLevelMet = playerInfo.hackingLevel >= levelRequired;
        let canBackdoor = enoughPorts && hackingLevelMet;

        return {
            hostname: server,
            requiredPorts: portsRequired,
            requiredHackLevel: levelRequired,
            backdoorInstalled: backdoorInstalled,
            canBackdoor: canBackdoor
        }
    });
}

export function getPlayerInfo(ns: NS) : BackdoorPlayerInfo {
    return {
        programCount: getProgramCount(ns),
        hackingLevel: ns.getHackingLevel()
    }
}

export type BackdoorPlayerInfo = {
    programCount: number,
    hackingLevel: number
};

export type BackdoorInfo = {
    hostname: string,
    requiredPorts: number,
    requiredHackLevel: number,
    backdoorInstalled: boolean,
    canBackdoor: boolean
};

export function listServersWithoutBackdoorInstalled(ns: NS) : string[] {
    return getNodeServerNames(ns)
        .filter(it => !ns.getServer(it).backdoorInstalled);
}