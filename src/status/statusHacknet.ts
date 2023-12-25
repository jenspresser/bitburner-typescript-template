import { NS } from "@ns";
import { HACKNET, ModuleName, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  HacknetStatusScript.INSTANCE.onMain(ns);
}

export class HacknetStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("hacknet", "hn");
  static INSTANCE = new HacknetStatusScript();

  constructor() {
    super(HACKNET, HacknetStatusScript.NAME, "Purchase Hacknet on");
  }
}