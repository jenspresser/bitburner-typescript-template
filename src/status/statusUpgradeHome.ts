import { NS } from "@ns";
import { UPGRADE_HOME, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    UpgradeHomeStatusScript.INSTANCE.onMain(ns);
}

export class UpgradeHomeStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "upgradeHome";
  static INSTANCE = new UpgradeHomeStatusScript();

  constructor() {
    super(UPGRADE_HOME, UpgradeHomeStatusScript.NAME, "Upgrade Home", "uh");
  }
}