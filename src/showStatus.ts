import { NS } from "@ns";
import { readTargetMode, getProgramCount } from "/hack/libhack";
import { getPurchasedServerNames } from "/libserver";
import { HackingStatusScript } from "/status/statusHacking";
import { PservStatusScript } from "/status/statusPserv";
import { HacknetStatusScript } from "/status/statusHacknet";
import { ShareStatusScript } from "/status/statusShare";
import { StockStatusScript } from "/status/statusStocks";
import { printTable } from "/table";
import { GangStatusScript } from "/status/statusGang";
import { StatusProperty } from "/libscripts";

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

	let statusFromProperties = [
		TargetModeStatusProperty.INSTANCE,
		ProgramCountStatusProperty.INSTANCE,
		PservCountStatusProperty.INSTANCE,
		ScriptGainMoneyStatusProperty.INSTANCE,
		ScriptGainExperienceStatusProperty.INSTANCE
	].map(it => it.getStatus(ns));

	let matrix = [
		...statusFromExecutors,
		...statusFromProperties
	]

	printTable(ns, matrix, {
		header: ["Action", "State"],
		horizontalSeparator: "first",
		align: ["left", "right"]
	});
}

export class TargetModeStatusProperty extends StatusProperty {
	static INSTANCE = new TargetModeStatusProperty();

	constructor() {
		super("targetMode", "Target Mode");
	}

	getValue(ns: NS): string {
		return readTargetMode(ns);
	}
}

export class ProgramCountStatusProperty extends StatusProperty {
	static INSTANCE = new ProgramCountStatusProperty();

	constructor() {
		super("programCount", "Programs");
	}

	getValue(ns: NS): string {
		return ""+getProgramCount(ns);
	}
}

export class PservCountStatusProperty extends StatusProperty {
	static INSTANCE = new PservCountStatusProperty();

	constructor() {
		super("pservCount", "Purchased Servers");
	}

	getValue(ns: NS): string {
		return ""+getPurchasedServerNames(ns).length;
	}
}

export class ScriptGainMoneyStatusProperty extends StatusProperty {
	static INSTANCE = new ScriptGainMoneyStatusProperty();

	constructor() {
		super("scriptGainMoney", "Script Gain ($/s)");
	}

	getValue(ns: NS): string {
		return ns.formatNumber(ns.getTotalScriptIncome()[0]);
	}
}



export class ScriptGainExperienceStatusProperty extends StatusProperty {
	static INSTANCE = new ScriptGainExperienceStatusProperty();

	constructor() {
		super("scriptGainExp", "Script Gain (Exp)");
	}

	getValue(ns: NS): string {
		return ns.formatNumber(ns.getTotalScriptExpGain());
	}
}

