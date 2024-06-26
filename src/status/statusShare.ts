import { NS } from "@ns";
import { getServersWithRootAccess } from "/libserver";
import { DistributedTaskStatusScript, ModuleName, SHARE } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  ShareStatusScript.INSTANCE.onMain(ns);
}

export class ShareStatusScript extends DistributedTaskStatusScript {
  static NAME = new ModuleName("share", "sh");
  static INSTANCE = new ShareStatusScript();

  constructor() {
    super(SHARE, ShareStatusScript.NAME, "Share");
  }

  startOnServer(ns: NS, server: string): void {
    if (!this.script.isRunningOnServer(ns, server)) {
      let shareRam = this.script.ram(ns);
      let availRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
  
      let threads = Math.floor(availRam / shareRam);
  
      if (threads > 0) {
        this.script.execOnServer(ns, server, threads);
      }
    }
  }

  getRunOnServers(ns: NS): string[] {
    return ["home"].concat(getServersWithRootAccess(ns));
  }
}