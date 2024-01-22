import { NS } from "@ns";
import { findPath, PathResult, printHelp } from "/libpath";

/** @param {NS} ns **/
export async function main(ns: NS) {
	const executable = "path";
	let shouldBackdoor = ns.args.some(it => ["backdoor", "bd", "b"].includes(it.toString()));

	if (ns.args.length === 0 || ns.args[0] === "list") {
		printHelp(ns, executable);
		return;
	}

	let startServer = ns.getHostname();

	let target = ns.args[0];
	if (target === undefined) {
		printHelp(ns, executable);
		return;
	}

	let result = findPath(ns, target.toString(), startServer, [], [], false);
	if (!result.isFound) {
		ns.alert('Server not found!');
	} else {
		ns.tprint(result.format(shouldBackdoor));
	}
}

export function autocomplete(data: any, args: string[]) : string[] {
	return data["servers"];
}

