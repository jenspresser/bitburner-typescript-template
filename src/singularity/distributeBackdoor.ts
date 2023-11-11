import { NS } from "@ns";
import { getBackdoorInfos } from "/libbackdoor";
import { findPath } from "/libpath";

export async function main(ns: NS) {
    const backdoorInfos = getBackdoorInfos(ns).filter(it => it.canBackdoor);

    for (let backdoorInfo of backdoorInfos) {
        let target = backdoorInfo.hostname;

        connectToTarget(ns, target);

        await ns.singularity.installBackdoor();

        ns.toast("Installed Backdoor on Server " + target);

        connectToTarget(ns, "home");
    }
}

function connectToTarget(ns: NS, target: string) {
    let pathResult = findPathToTarget(ns, target);

    let connectServerList = pathResult.serverList;

    for (let server of connectServerList) {
        ns.singularity.connect(server);
    }
}

function findPathToTarget(ns: NS, target: string) {
    return findPath(ns, target, ns.getHostname(), [], [], false);
}