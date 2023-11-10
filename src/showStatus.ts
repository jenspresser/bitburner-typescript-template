import { NS } from "@ns";
import { readTargetMode, getProgramCount } from "/hack/libhack";
import { getPurchasedServerNames } from "/libserver";
import { HackingStatusScript } from "/statusHacking";
import { PservStatusScript } from "./statusPserv";
import { HacknetStatusScript } from "./statusHacknet";
import { ShareStatusScript } from "/statusShare";
import { StockStatusScript } from "/statusStocks";
import { printTable } from "/table";
import { GangStatusScript } from "./statusGang";

export const HOME_RESERVE_RAM = 32;

/** @param {NS} ns */
export async function main(ns: NS) {
    printStatus(ns);
}

/** @param {NS} ns */
function printStatus(ns: NS) {
	let statusFromExecutors = [
		HackingStatusScript.INSTANCE,
		HacknetStatusScript.INSTANCE,
		PservStatusScript.INSTANCE,
		StockStatusScript.INSTANCE,
		ShareStatusScript.INSTANCE,
		GangStatusScript.INSTANCE
	].map(it => it.getStatus(ns));

	let matrix = [
		["Target Mode", readTargetMode(ns)],
		...statusFromExecutors,
		["Programs", getProgramCount(ns)],
		["Purchased Servers", getPurchasedServerNames(ns).length],
		["Script Gain ($/s)", ns.formatNumber(ns.getTotalScriptIncome()[0])],
		["Script Gain (Exp)", ns.formatNumber(ns.getTotalScriptExpGain())]
	]

	printTable(ns, matrix, {
		header: ["Action", "State"],
		horizontalSeparator: "first",
		align: ["left", "right"]
	});
}
