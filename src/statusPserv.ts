import { NS } from "@ns";
import { StatusScriptExecutor } from "./libscripts";
import { PURCHASE_SERVER_SCRIPTS } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  PservStatusScriptExecutor.INSTANCE.onMain(ns);
}

export class PservStatusScriptExecutor extends  StatusScriptExecutor {
  static NAME="pserv";
  static INSTANCE = new PservStatusScriptExecutor();

  constructor() {
    super(PservStatusScriptExecutor.NAME, "Purchase Pserv on");
  }

  start(ns: NS): void {
    ns.tprint("Start Purchasing Pserv! ");
    for (let script of PURCHASE_SERVER_SCRIPTS) {
      if (!script.isRunningOnHome(ns)) {
        script.execOnHome(ns);
      }
    }
  }
  stop(ns: NS): void {
    ns.tprint("Stop Purchasing Pserv!");
    for (let script of PURCHASE_SERVER_SCRIPTS) {
      script.killOnHome(ns);
    }
  }
  isRunning(ns: NS): boolean {
    return PURCHASE_SERVER_SCRIPTS.filter(it => it.isRunningOnHome(ns)).length > 0;
  }
  neededStartRam(ns: NS): number {
    return PURCHASE_SERVER_SCRIPTS.map(script => script.ram(ns)).reduce((sum, current) => sum + current, 0);
  }
}