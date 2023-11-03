import { NS } from "@ns";
import { calcHomeReserveRam, canRunGangOnHome } from "/initHome";
import { ServerInfo, getServerInfo, getServersWithRootAccess } from "/libserver";

export const SCRIPTNAME_GANG = "crime_gang/gang.js";
export const SCRIPT_GANG = "/" + SCRIPTNAME_GANG;

export function getGangScriptRam(ns: NS) : number {
    return Math.ceil(ns.getScriptRam(SCRIPTNAME_GANG));
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