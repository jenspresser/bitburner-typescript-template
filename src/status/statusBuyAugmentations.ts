import { NS } from "@ns";
import { BUY_AUGMENTATIONS, ModuleName, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  BuyAugmentationsStatusScript.INSTANCE.onMain(ns);
}

export class BuyAugmentationsStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("buyAugmentations", "aug");
  static INSTANCE = new BuyAugmentationsStatusScript();

  constructor() {
    super(BUY_AUGMENTATIONS, BuyAugmentationsStatusScript.NAME, "Buy Augmentations");
  }
}