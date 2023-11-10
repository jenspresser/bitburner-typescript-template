import { NS } from "@ns";
import { HACKNET, StatusScriptExecutor } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  HacknetStatusScriptExecutor.INSTANCE.onMain(ns);
}

export class HacknetStatusScriptExecutor extends StatusScriptExecutor {
  static NAME = "hacknet";
  static INSTANCE = new HacknetStatusScriptExecutor();

  constructor() {
    super(HacknetStatusScriptExecutor.NAME, "Purchase Hacknet on");
  }

  start(ns: NS): void {
    ns.tprint("Start Purchasing Hacknet! ");
    if (!HACKNET.isRunningOnHome(ns)) {
      HACKNET.execOnHome(ns);
    }
  }

  stop(ns: NS): void {
    ns.tprint("Stop Purchasing Hacknet!");
    HACKNET.killOnHome(ns);
  }

  isRunning(ns: NS): boolean {
    return HACKNET.isRunningOnHome(ns);
  }

  neededStartRam(ns: NS): number {
    return HACKNET.ram(ns);
  }
}