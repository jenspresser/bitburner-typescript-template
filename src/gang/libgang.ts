import { NS } from "@ns";
import { ServerInfo, getServerInfo } from "/libserver";
import { canRunGangOnHome } from "/libram";
import { GANG } from "/libscripts";

export function getGangScriptRam(ns: NS) : number {
    return GANG.ram(ns);
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
        .filter(server => server.hostname !== "home")
        .filter(server => server.hasRoot)
        .filter(server => server.maxRam > gangScriptRam);

    candidateServers.sort(ServerInfo.sortByRamAsc());

    if(candidateServers.length > 0) {
        return candidateServers[0].hostname;
    }

    return undefined;
}

export function statusGangOutput(ns: NS) : string {
    const isRunning = GANG.isRunningOnAnyServers(ns);

    if(!isRunning) {
        return "false";
    }

    return "on " + getGangScriptServer(ns);
}