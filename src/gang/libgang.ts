import { NS } from "@ns";
import { ServerInfo, getServerInfo } from "/libserver";
import { canRunGangOnHome } from "/libhome";
import { GANG } from "/libscripts";

export function getGangScriptRam(ns: NS) : number {
    return Math.ceil(GANG.ram(ns));
}

export function canRunGang(ns: NS) : boolean {
    return getGangScriptServer(ns) !== undefined;
}

export function getGangScriptServer(ns: NS) : string|undefined {
    if(canRunGangOnHome(ns)) {
        return "home"
    }

    const gangScriptRam = getGangScriptRam(ns);

    const candidateServers = getServerInfo(ns)
        .filter(server => server.hasRoot)
        .filter(server => server.maxRam > gangScriptRam)
        .sort(ServerInfo.sortByRamAsc());

    if(candidateServers.length > 0) {
        return candidateServers[0].hostname;
    }

    return undefined;

}