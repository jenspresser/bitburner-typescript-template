import { NS } from "@ns";
import { initializeTargetMode, persistTargetMode } from "/hack/libhack";
import { STATUSGANG } from "./libscripts";
import { PservStatusScript } from "./statusPserv";
import { HacknetStatusScript } from "./statusHacknet";
import { HackingStatusScript } from "./statusHacking";

export const HOME_RESERVE_RAM = 32;
const HOME = "home";

/** @param {NS} ns */
export async function main(ns: NS) {
	let preventPurchase = ns.args.filter(arg => arg === "nopurchase" || arg === "no").length > 0;
	let shouldPurchase = !preventPurchase;
	let shouldStartGang = ns.args.filter(arg => arg === "gang" || arg === "g").length > 0;

	initializeTargetMode(ns);

	let shouldStop = ns.args[0] === "stop";

	const MODE_PREFIX = "mode=";
	if (ns.args[0] && (typeof ns.args[0] === 'string') && ns.args[0].startsWith(MODE_PREFIX)) {
		let mode = ns.args[0].substring(MODE_PREFIX.length);

		ns.tprint("set target mode to ", mode, ", restart Hacking");
		persistTargetMode(ns, mode);

		await restartHacking(ns);
		return;
	}

	if (shouldStop) {
		stopHacking(ns);
		stopPurchasePserv(ns);
		stopPurchaseHacknet(ns);
		stopGang(ns);
		return;
	}

	ns.tprint("Purchase set to: ", shouldPurchase);
	await ns.sleep(100);
	startHacking(ns);

	if (shouldPurchase) {
		await ns.sleep(100);
		startPurchasePserv(ns);
		startPurchaseHacknet(ns);
	}

	if(shouldStartGang) {
		await ns.sleep(100);
		startGang(ns);
	}
}

async function restartHacking(ns: NS) {
	stopHacking(ns);
	await ns.sleep(100);
	startHacking(ns);
}


function stopHacking(ns: NS) {
	HackingStatusScript.INSTANCE.stop(ns);
}
function startHacking(ns: NS) {
	HackingStatusScript.INSTANCE.start(ns);
}

function stopPurchasePserv(ns: NS) {
	PservStatusScript.INSTANCE.stop(ns);
}
function startPurchasePserv(ns: NS) {
	PservStatusScript.INSTANCE.start(ns);
}

function stopPurchaseHacknet(ns: NS) {
	HacknetStatusScript.INSTANCE.stop(ns);
}
function startPurchaseHacknet(ns: NS) {
	HacknetStatusScript.INSTANCE.start(ns);
}

function stopGang(ns: NS) {
	STATUSGANG.stop(ns);
}
function startGang(ns: NS) {
	STATUSGANG.start(ns);
}