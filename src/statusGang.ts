import { NS } from "@ns";
import { getGangScriptServer } from "/gang/libgang";
import { DistributedTaskStatusScript, GANG } from "./libscripts";
import { HackingStatusScript } from "./statusHacking";

/** @param {NS} ns */
export async function main(ns: NS) {
    GangStatusScript.INSTANCE.onMain(ns);
}



export class GangStatusScript extends DistributedTaskStatusScript {
    static NAME = "gang";
    static INSTANCE = new GangStatusScript();

    constructor() {
        super(GANG, GangStatusScript.NAME, "Gang", "g");
    }

    beforeStart(ns: NS): void {
        const gangServer = getGangScriptServer(ns);

        if (gangServer !== undefined) {
            if (!this.script.isRunningOnServer(ns, gangServer) 
                    && HackingStatusScript.INSTANCE.isRunningOnServer(ns, gangServer)) {
                ns.tprint("    Stop Hacking on " + gangServer);
                HackingStatusScript.INSTANCE.stopOnServer(ns, gangServer);
            }
        }
    }

    getRunOnServers(ns: NS): string[] {
        const gangServer = getGangScriptServer(ns);

        if (gangServer !== undefined) {
            return [gangServer]
        } else {
            ns.tprint("No server available to run GANG script");
            return []
        }
    }

    getStatus(ns: NS): [string, string] {
        return [this.statusOutput, this.statusGangOutput(ns)];
    }

    private statusGangOutput(ns: NS): string {
        const isRunning = GANG.isRunningOnAnyServers(ns);

        if (!isRunning) {
            return "false";
        }

        return "on " + getGangScriptServer(ns);
    }

}