import { NS } from "@ns";
import { PSERV, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  PservStatusScript.INSTANCE.onMain(ns);
}

export class PservStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "pserv";
  static INSTANCE = new PservStatusScript();

  constructor() {
    super(PSERV, PservStatusScript.NAME, "Purchase Pserv on", "ps");
  }
}