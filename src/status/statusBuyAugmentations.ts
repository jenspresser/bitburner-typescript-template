import { NS } from "@ns";
import { BUY_AUGMENTATIONS, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  BuyAugmentationsStatusScript.INSTANCE.onMain(ns);
}

export class BuyAugmentationsStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "buyAugmentations";
  static INSTANCE = new BuyAugmentationsStatusScript();

  constructor() {
    super(BUY_AUGMENTATIONS, BuyAugmentationsStatusScript.NAME, "Buy Augmentations", "aug");
  }
}