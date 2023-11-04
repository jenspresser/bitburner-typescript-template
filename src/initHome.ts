import { NS } from "@ns";
import { readTargetMode, initializeTargetMode, persistTargetMode, getProgramCount } from "/hack/libhack";
import { getPurchasedServerNames } from "/libserver";
import { isRunningHacking } from "/statusHacking";
import { isRunningHacknet, isRunningPurchasingServers } from "/statusPurchase";
import { isRunningSharing } from "/statusShare";
import { isRunningStock } from "/statusStocks";
import { printTable } from "/table";
import { GANG, STATUSGANG, STATUSHACKING, STATUSPURCHASE } from "./libscripts";

export const HOME_RESERVE_RAM = 32;
const HOME = "home";

/** @param {NS} ns */
export async function main(ns: NS) {
	let preventPurchase = ns.args[0] === "nopurchase" || ns.args[0] === "no";
	let shouldPurchase = !preventPurchase;
	let shouldStartGang = ns.args.filter(arg => arg === "gang" || arg === "g").length > 0;

	initializeTargetMode(ns);

	let shouldStop = ns.args[0] === "stop";
	let shouldPrintStatus = ns.args[0] === "status";

	const MODE_PREFIX = "mode=";
	if (ns.args[0] && (typeof ns.args[0] === 'string') && ns.args[0].startsWith(MODE_PREFIX)) {
		let mode = ns.args[0].substring(MODE_PREFIX.length);

		ns.tprint("set target mode to ", mode, ", restart Hacking");
		persistTargetMode(ns, mode);

		restartHacking(ns);
		return;
	}

	if (shouldPrintStatus) {
		printStatus(ns);

		return;
	}

	if (shouldStop) {
		stopHacking(ns);
		stopPurchase(ns);
		stopGang(ns);
		return;
	}

	ns.tprint("Purchase set to: ", shouldPurchase);
	await ns.sleep(100);
	startHacking(ns);

	if (shouldPurchase) {
		await ns.sleep(100);
		startPurchase(ns);
	}

	if(shouldStartGang) {
		await ns.sleep(100);
		startGang(ns);
	}
}

function restartHacking(ns: NS) {
	stopHacking(ns);
	startHacking(ns);
}
/** @param {NS} ns */
function stopHacking(ns: NS) {
	STATUSHACKING.execOnHomeArgsOnly(ns, "stop");
}
/** @param {NS} ns */
function startHacking(ns: NS) {
	STATUSHACKING.execOnHomeArgsOnly(ns, "start");
}
/** @param {NS} ns */
function stopPurchase(ns: NS) {
	STATUSPURCHASE.execOnHomeArgsOnly(ns, "stop");
}
/** @param {NS} ns */
function startPurchase(ns: NS) {
	STATUSPURCHASE.execOnHomeArgsOnly(ns, "start");
}
/** @param {NS} ns */
function stopGang(ns: NS) {
	STATUSGANG.execOnHomeArgsOnly(ns, "stop");
}
/** @param {NS} ns */
function startGang(ns: NS) {
	STATUSGANG.execOnHomeArgsOnly(ns, "start");
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
		["Gang", GANG.isRunningOnAnyServers(ns)],
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
