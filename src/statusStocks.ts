import { NS } from "@ns";
import { STOCK, SingleScriptOnHomeStatusScript } from "./libscripts";

/** @param {NS} ns */
export async function main(ns: NS) {
  StockStatusScript.INSTANCE.onMain(ns);
}

export class StockStatusScript extends SingleScriptOnHomeStatusScript {
  static NAME = "stock";
  static INSTANCE = new StockStatusScript();

  constructor() {
    super(STOCK, StockStatusScript.NAME, "Stocks on", "st");
  }
}