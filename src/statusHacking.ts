import { NS } from "@ns";
import {
  ALL_HACK_SCRIPTS,
  DISTRIBUTEHACK,
  DistributedTaskStatusScript,
  MASTERHACK,
  SingleScriptOnHomeStatusScript
} from "./libscripts";
import { getServersWithRootAccess } from "/libserver";

/** @param {NS} ns */
export async function main(ns: NS) {
  HackingStatusScript.INSTANCE.onMain(ns);
}

export class HackingStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "hacking";
  static INSTANCE = new HackingStatusScript();

  constructor() {
    super(DISTRIBUTEHACK, HackingStatusScript.NAME, "Hacking");
  }

  afterStop(ns: NS): void {
    for (let server of MASTERHACK.isRunningOnTheseServers(ns)) {
      this.stopOnServer(ns, server);
    }
  }

  stopOnServer(ns: NS, server: string) {
    MASTERHACK.killOnServer(ns, server);

    for (let hackScript of ALL_HACK_SCRIPTS) {
      hackScript.killOnServer(ns, server);
    }
  }

  isRunningOnServer(ns: NS, server: string): boolean {
    return MASTERHACK.isRunningOnServer(ns, server);
  }

}
