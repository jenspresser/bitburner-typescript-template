import { NS } from "@ns";
import { initializeTargetMode, persistTargetMode } from "/hack/libhack";
import { HackingStatusScript } from "./status/statusHacking";

const HOME = "home";

/** @param {NS} ns */
export async function main(ns: NS) {
	initializeTargetMode(ns);

	const MODE_PREFIX = "mode=";
	if (ns.args[0] && (typeof ns.args[0] === 'string') && ns.args[0].startsWith(MODE_PREFIX)) {
		let mode = ns.args[0].substring(MODE_PREFIX.length);

		ns.tprint("set target mode to ", mode, ", restart Hacking");
		persistTargetMode(ns, mode);

		await HackingStatusScript.INSTANCE.restart(ns);
		return;
	}

	
}