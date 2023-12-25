import { NS } from "@ns";
import { JOINING_FACTIONS, ModuleName, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    JoiningFactionsStatusScript.INSTANCE.onMain(ns);
}

export class JoiningFactionsStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("joinFactions", "jf");
  static INSTANCE = new JoiningFactionsStatusScript();

  constructor() {
    super(JOINING_FACTIONS, JoiningFactionsStatusScript.NAME, "Joining Factions");
  }
}