import { NS } from "@ns";
import { JOINING_FACTIONS, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    JoiningFactionsStatusScript.INSTANCE.onMain(ns);
}

export class JoiningFactionsStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "joinFactions";
  static INSTANCE = new JoiningFactionsStatusScript();

  constructor() {
    super(JOINING_FACTIONS, JoiningFactionsStatusScript.NAME, "Joining Factions", "jf");
  }
}