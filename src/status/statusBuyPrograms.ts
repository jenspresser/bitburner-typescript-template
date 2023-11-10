import { NS } from "@ns";
import { BUY_PROGRAMS, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    BuyProgramsStatusScript.INSTANCE.onMain(ns);
  }
  
  export class BuyProgramsStatusScript extends SingleScriptOnHomeStatusScript {
    static NAME = "buyPrograms";
    static INSTANCE = new BuyProgramsStatusScript();
  
    constructor() {
      super(BUY_PROGRAMS, BuyProgramsStatusScript.NAME, "Buy Programs", "bp");
    }
  }