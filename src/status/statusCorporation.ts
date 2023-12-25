import { NS } from "@ns";
import { CORPORATION, ModuleName, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  CorporationStatusScript.INSTANCE.onMain(ns);
}

export class CorporationStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("corporation", "corp");
  static INSTANCE = new CorporationStatusScript();

  constructor() {
    super(CORPORATION, CorporationStatusScript.NAME, "Corporation");
  }
}