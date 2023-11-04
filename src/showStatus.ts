import { NS } from "@ns";
import { readTargetMode, getProgramCount } from "/hack/libhack";
import { getPurchasedServerNames } from "/libserver";
import { isRunningHacking } from "/statusHacking";
import { isRunningHacknet, isRunningPurchasingServers } from "/statusPurchase";
import { isRunningSharing } from "/statusShare";
import { isRunningStock } from "/statusStocks";
import { printTable } from "/table";
import { statusGangOutput } from "./gang/libgang";

export const HOME_RESERVE_RAM = 32;
const HOME = "home";

/** @param {NS} ns */
export async function main(ns: NS) {
    printStatus(ns);
}

/** @param {NS} ns */
function printStatus(ns: NS) {
	let matrix = [
		["Hacking", isRunningHacking(ns)],
		["Target Mode", readTargetMode(ns)],
		["Purchase Servers on", isRunningPurchasingServers(ns)],
		["Purchase Hacknet on", isRunningHacknet(ns)],
		["Sharing", isRunningSharing(ns)],
		["Stocks", isRunningStock(ns)],
		["Gang", statusGangOutput(ns)],
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
