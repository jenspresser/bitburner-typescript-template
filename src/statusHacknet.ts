import { NS } from "@ns";
import { StatusScriptExecutor } from "./libscripts";
import { HACKNET_SCRIPTS } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  HacknetStatusScriptExecutor.INSTANCE.onMain(ns);
}

export class HacknetStatusScriptExecutor extends StatusScriptExecutor {
  static NAME="hacknet";
  static INSTANCE = new HacknetStatusScriptExecutor();

  constructor() {
    super(HacknetStatusScriptExecutor.NAME, "Purchase Hacknet on");
  }

  start(ns: NS): void {
    ns.tprint("Start Purchasing Hacknet! ");
    for (let script of HACKNET_SCRIPTS) {
      if (!script.isRunningOnHome(ns)) {
        script.execOnHome(ns);
      }
    }
  }
  stop(ns: NS): void {
    ns.tprint("Stop Purchasing Hacknet!");
    for (let script of HACKNET_SCRIPTS) {
      script.killOnHome(ns);
    }
  }
  isRunning(ns: NS): boolean {
    return HACKNET_SCRIPTS.filter(it => it.isRunningOnHome(ns)).length > 0;
  }
  neededStartRam(ns: NS): number {
    return HACKNET_SCRIPTS.map(script => script.ram(ns)).reduce((sum, current) => sum + current, 0);
  }
}