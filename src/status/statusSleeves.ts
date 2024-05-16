import { NS } from "@ns";
import { ModuleName, SLEEVE, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
    SleeveStatusScript.INSTANCE.onMain(ns);
  }

export class SleeveStatusScript extends SingleScriptOnHomeStatusScript {
    static NAME = new ModuleName("sleeve", "slv");
    static INSTANCE = new SleeveStatusScript();
  
    constructor() {
      super(SLEEVE, SleeveStatusScript.NAME, "Sleeves on");
    }
  }