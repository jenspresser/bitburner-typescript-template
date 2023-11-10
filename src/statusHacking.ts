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

  stop(ns: NS): void {
    super.stop(ns);

    for (let server of getServersWithRootAccess(ns)) {
      MASTERHACK.killOnServer(ns, server);

      for (let hackScript of ALL_HACK_SCRIPTS) {
        hackScript.killOnServer(ns, server);
      }
    }
  }

}
