import { NS } from "@ns";
import { ModuleName, STOCK, SingleScriptOnHomeStatusScript } from "/libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  StockStatusScript.INSTANCE.onMain(ns);
}

export class StockStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = new ModuleName("stock", "st");
  static INSTANCE = new StockStatusScript();

  constructor() {
    super(STOCK, StockStatusScript.NAME, "Stocks on");
  }
}