import { NS } from "@ns";
import { PSERV, StatusScriptExecutor } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  PservStatusScriptExecutor.INSTANCE.onMain(ns);
}

export class PservStatusScriptExecutor extends StatusScriptExecutor {
  static NAME = "pserv";
  static INSTANCE = new PservStatusScriptExecutor();

  constructor() {
    super(PservStatusScriptExecutor.NAME, "Purchase Pserv on");
  }

  start(ns: NS): void {
    ns.tprint("Start Purchasing Pserv! ");
    if (!PSERV.isRunningOnHome(ns)) {
      PSERV.execOnHome(ns);
    }
  }

  stop(ns: NS): void {
    ns.tprint("Stop Purchasing Pserv!");
    PSERV.killOnHome(ns);
  }

  isRunning(ns: NS): boolean {
    return PSERV.isRunningOnHome(ns);
  }

  neededStartRam(ns: NS): number {
    return PSERV.ram(ns);
  }
}