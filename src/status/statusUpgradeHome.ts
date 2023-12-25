import { NS } from "@ns";
import { UPGRADE_HOME, SingleScriptOnHomeStatusScript, ModuleName } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    UpgradeHomeStatusScript.INSTANCE.onMain(ns);
}

export class UpgradeHomeStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("upgradeHome", "uh");
  static INSTANCE = new UpgradeHomeStatusScript();

  constructor() {
    super(UPGRADE_HOME, UpgradeHomeStatusScript.NAME, "Upgrade Home");
  }
}